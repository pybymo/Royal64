// Royal64 USDT Escrow — same match lifecycle as escrow.tact, but for
// stakes paid in USDT (a Jetton on TON, TEP-74) instead of native TON.
//
// ⚠️  UNAUDITED. Jetton handling is a well-documented source of real
// exploits on TON specifically (fake jetton wallets, spoofed transfer
// notifications) — this needs testnet soak testing AND an audit even
// more than the plain-TON contract does. Kept as a SEPARATE contract
// from escrow.tact on purpose: mixing jetton accounting into the
// already-simpler TON contract would grow the audited surface of
// both at once instead of letting each be reviewed on its own.
//
// Security model for accepting jetton deposits (this is the part that
// gets contracts drained if done wrong):
//
//   1. We NEVER trust the `sender` field inside a JettonTransferNotification
//      body — that's just who the token owner claims to be, and it's
//      inside a message body an attacker fully controls.
//   2. We ONLY trust the notification if it was sent by
//      `self.usdtJettonWallet` — OUR contract's own jetton-wallet
//      contract for USDT specifically, whose address we verify and
//      set once after deployment (see SetJettonWallet below). Only
//      the real USDT jetton-wallet belonging to this contract can
//      ever be at that address, because jetton-wallet addresses are
//      deterministically derived on-chain from (jetton master, owner) —
//      an attacker cannot make a fake wallet be found at that exact
//      address.
//   3. Payouts go back out THROUGH that same verified jetton wallet
//      (we ask it to transfer on our behalf) — we never try to move
//      jettons directly, since a contract doesn't hold jettons itself,
//      its jetton wallet does.

import "@stdlib/deploy";

const FEE_BPS: Int = 300;
const MIN_GAS_RESERVE: Int = ton("0.05");

// --- TEP-74 standard jetton messages (fixed opcodes, not ours to change) ---

message(0x0f8a7ea5) JettonTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    responseDestination: Address;
    customPayload: Cell?;
    forwardTonAmount: Int as coins;
    forwardPayload: Slice as remaining;
}

message(0x7362d09c) JettonTransferNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address; // informational only — see security notes above, never used for auth
    forwardPayload: Slice as remaining;
}

// --- Our own messages ---

message CreateMatch {
    matchId: Int as uint64;
    playerA: Address;
    playerB: Address;
    stake: Int as coins;             // in USDT's own smallest unit (6 decimals, not TON's 9)
    depositDeadline: Int as uint32;
    resolveDeadline: Int as uint32;
}

message DeclareResult {
    matchId: Int as uint64;
    winner: Address?;
}

message CancelExpired {
    matchId: Int as uint64;
}

message ForceSplit {
    matchId: Int as uint64;
}

message SetOracle {
    newOracle: Address;
}

message SetTreasury {
    newTreasury: Address;
}

// Owner-only, called once after deployment: query this contract's own
// USDT jetton-wallet address off-chain (via the USDT master's
// get_wallet_address getter, e.g. through TonAPI) and set it here.
// Every deposit is rejected until this is set — there is no working
// default, on purpose, rather than trusting an unset/zero address.
message SetJettonWallet {
    wallet: Address;
}

struct Match {
    playerA: Address;
    playerB: Address;
    stake: Int as coins;
    depositDeadline: Int as uint32;
    resolveDeadline: Int as uint32;
    depositedA: Bool;
    depositedB: Bool;
    status: Int as uint8;
}

const STATUS_WAITING: Int = 0;
const STATUS_ACTIVE: Int = 1;
const STATUS_RESOLVED: Int = 2;
const STATUS_CANCELLED: Int = 3;

contract Royal64EscrowUsdt with Deployable {

    owner: Address;
    oracle: Address;
    treasury: Address;

    // Set once via SetJettonWallet after deployment — see security
    // notes at the top of this file for why deposits are rejected
    // until this is configured.
    usdtJettonWallet: Address? = null;

    matches: map<Int as uint64, Match>;

    init(owner: Address, oracle: Address, treasury: Address) {
        self.owner = owner;
        self.oracle = oracle;
        self.treasury = treasury;
    }

    // ------------------------------------------------------------------
    // Admin
    // ------------------------------------------------------------------

    receive(msg: SetOracle) {
        require(sender() == self.owner, "only owner");
        self.oracle = msg.newOracle;
    }

    receive(msg: SetTreasury) {
        require(sender() == self.owner, "only owner");
        self.treasury = msg.newTreasury;
    }

    receive(msg: SetJettonWallet) {
        require(sender() == self.owner, "only owner");
        self.usdtJettonWallet = msg.wallet;
    }

    // ------------------------------------------------------------------
    // Match lifecycle
    // ------------------------------------------------------------------

    receive(msg: CreateMatch) {
        require(sender() == self.oracle, "only oracle");
        require(self.matches.get(msg.matchId) == null, "match id already exists");
        require(msg.playerA != msg.playerB, "players must differ");
        require(msg.stake > 0, "stake must be positive");
        require(msg.depositDeadline > now(), "depositDeadline in the past");
        require(msg.resolveDeadline > msg.depositDeadline, "resolveDeadline must be after depositDeadline");

        self.matches.set(msg.matchId, Match{
            playerA: msg.playerA,
            playerB: msg.playerB,
            stake: msg.stake,
            depositDeadline: msg.depositDeadline,
            resolveDeadline: msg.resolveDeadline,
            depositedA: false,
            depositedB: false,
            status: STATUS_WAITING,
        });
    }

    // A deposit arrives as a jetton transfer notification, NOT as a
    // Deposit message with attached value the way the TON contract
    // works — see the security notes at the top for why the sender
    // check below is the only thing standing between this contract
    // and a fake-token drain.
    receive(msg: JettonTransferNotification) {

        require(self.usdtJettonWallet != null, "jetton wallet not configured");
        require(sender() == self.usdtJettonWallet!!, "untrusted jetton wallet");

        // forwardPayload carries: opcode (uint32) ++ matchId (uint64) ++
        // depositor (Address) — the depositor field is OUR way of
        // knowing which side (A/B) this is for, since the jetton
        // notification's own `sender` field is not trustworthy for
        // that (see top-of-file notes) but a value baked into the
        // payload *we* told the frontend to construct, cross-checked
        // against the match's known playerA/playerB, is fine — we're
        // not trusting it for identity, only using it to route within
        // data we already authenticated the value transfer for.
        let payload: Slice = msg.forwardPayload;
        let opcode: Int = payload.loadUint(32);
        require(opcode == 0x52364444, "unexpected forward payload"); // "R64D" tag
        let matchId: Int = payload.loadUint(64);
        let depositor: Address = payload.loadAddress();

        let m: Match = self.matches.get(matchId)!!;

        require(m.status == STATUS_WAITING || m.status == STATUS_ACTIVE, "match not accepting deposits");
        require(now() <= m.depositDeadline, "deposit window closed");
        require(depositor == m.playerA || depositor == m.playerB, "not a player in this match");
        require(msg.amount >= m.stake, "insufficient deposit amount");

        if (depositor == m.playerA) {
            require(!m.depositedA, "playerA already deposited");
            m.depositedA = true;
        } else {
            require(!m.depositedB, "playerB already deposited");
            m.depositedB = true;
        }

        // Overpayment refund is intentionally NOT handled here the way
        // the TON contract does it — refunding jettons requires
        // another full JettonTransfer round-trip, and silently
        // keeping a small accidental overpayment is the lesser risk
        // versus the added complexity/gas of an automatic jetton
        // refund path. Document this clearly to users instead: send
        // exactly the stake amount.

        if (m.depositedA && m.depositedB) {
            m.status = STATUS_ACTIVE;
        }

        self.matches.set(matchId, m);
    }

    receive(msg: DeclareResult) {
        let m: Match = self.matches.get(msg.matchId)!!;

        require(sender() == self.oracle, "only oracle");
        require(m.status == STATUS_ACTIVE, "match not active");
        require(self.usdtJettonWallet != null, "jetton wallet not configured");

        let pot: Int = m.stake * 2;
        let fee: Int = pot * FEE_BPS / 10000;
        let payout: Int = pot - fee;

        m.status = STATUS_RESOLVED;
        self.matches.set(msg.matchId, m);

        if (msg.winner == null) {
            let half: Int = payout / 2;
            self.sendJetton(m.playerA, half);
            self.sendJetton(m.playerB, payout - half);
        } else {
            let w: Address = msg.winner!!;
            require(w == m.playerA || w == m.playerB, "winner not a player in this match");
            self.sendJetton(w, payout);
        }

        if (fee > 0) {
            self.sendJetton(self.treasury, fee);
        }
    }

    receive(msg: CancelExpired) {
        let m: Match = self.matches.get(msg.matchId)!!;

        require(m.status == STATUS_WAITING, "match not cancellable");
        require(now() > m.depositDeadline, "deposit window still open");

        m.status = STATUS_CANCELLED;
        self.matches.set(msg.matchId, m);

        if (m.depositedA) {
            self.sendJetton(m.playerA, m.stake);
        }
        if (m.depositedB) {
            self.sendJetton(m.playerB, m.stake);
        }
    }

    receive(msg: ForceSplit) {
        let m: Match = self.matches.get(msg.matchId)!!;

        require(m.status == STATUS_ACTIVE, "match not active");
        require(now() > m.resolveDeadline, "resolve deadline not reached yet");

        m.status = STATUS_RESOLVED;
        self.matches.set(msg.matchId, m);

        self.sendJetton(m.playerA, m.stake);
        self.sendJetton(m.playerB, m.stake);
    }

    // ------------------------------------------------------------------
    // Internal — sends jettons out through our verified jetton wallet
    //
    // NOTE ON CONFIDENCE: the JettonTransfer field layout above follows
    // the published TEP-74 standard, which is stable and well-sourced.
    // The exact Tact stdlib calls used here to build an empty payload
    // (beginCell().endCell().asSlice()) are the standard, well-known
    // pattern, but this function specifically has NOT been run through
    // an actual Tact compiler in this pass — check it compiles cleanly
    // before trusting it, same as everything else in this contract.
    // ------------------------------------------------------------------

    fun sendJetton(to: Address, amount: Int) {

        send(SendParameters{
            to: self.usdtJettonWallet!!,
            value: MIN_GAS_RESERVE,
            bounce: true,
            mode: SendIgnoreErrors,
            body: JettonTransfer{
                queryId: 0,
                amount: amount,
                destination: to,
                responseDestination: self.treasury,
                customPayload: null,
                forwardTonAmount: 0,
                forwardPayload: beginCell().endCell().asSlice(),
            }.toCell(),
        });
    }

    // ------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------

    get fun matchInfo(matchId: Int): Match? {
        return self.matches.get(matchId);
    }

    get fun jettonWallet(): Address? {
        return self.usdtJettonWallet;
    }
}
