// Royal64 Escrow — holds a single match's two stakes and pays out the
// winner (or splits on a draw), so the backend server is never the
// custodian of user funds (per the MVP's core financial principle).
//
// ⚠️  THIS CONTRACT HAS NOT BEEN AUDITED. Do not point it at mainnet
// with real user funds before an independent security audit and
// extensive testnet soak testing. Treat everything below as a
// carefully-reasoned first draft, not a finished, trusted artifact.
//
// State machine per match:
//
//   Waiting  -- both players deposit -->  Active
//   Waiting  -- deadline passes, <2 deposits -->  Cancelled (refund whoever paid)
//   Active   -- oracle declares result -->  Resolved (payout sent)
//   Active   -- oracle silent past resolveDeadline -->  anyone can ForceSplit (refund both, no fee)
//
// Every state transition is written BEFORE any outbound value message
// is sent, so a match can never be paid out twice even if an outbound
// message bounces or the transaction is replayed.

import "@stdlib/deploy";

const FEE_BPS: Int = 300; // 3.00%, in basis points (300 / 10000)
const MIN_GAS_RESERVE: Int = ton("0.05"); // withheld per outbound send for network fees

message CreateMatch {
    matchId: Int as uint64;
    playerA: Address;
    playerB: Address;
    stake: Int as coins;      // required deposit per player
    depositDeadline: Int as uint32;  // unix time
    resolveDeadline: Int as uint32;  // unix time after which ForceSplit is allowed
}

message Deposit {
    matchId: Int as uint64;
}

message DeclareResult {
    matchId: Int as uint64;
    winner: Address?;   // null => draw
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

struct Match {
    playerA: Address;
    playerB: Address;
    stake: Int as coins;
    depositDeadline: Int as uint32;
    resolveDeadline: Int as uint32;
    depositedA: Bool;
    depositedB: Bool;
    status: Int as uint8; // 0=Waiting 1=Active 2=Resolved 3=Cancelled
}

const STATUS_WAITING: Int = 0;
const STATUS_ACTIVE: Int = 1;
const STATUS_RESOLVED: Int = 2;
const STATUS_CANCELLED: Int = 3;

contract Royal64Escrow with Deployable {

    owner: Address;
    oracle: Address;   // backend's signing address — the only caller that
                        // may create matches and declare results
    treasury: Address; // fee sink

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

    receive(msg: Deposit) {
        let m: Match = self.matches.get(msg.matchId)!!;
        let s: Address = sender();

        require(m.status == STATUS_WAITING || m.status == STATUS_ACTIVE, "match not accepting deposits");
        require(now() <= m.depositDeadline, "deposit window closed");
        require(s == m.playerA || s == m.playerB, "not a player in this match");

        // context.value is the TON actually attached to this incoming message
        require(context().value >= m.stake, "insufficient deposit amount");

        if (s == m.playerA) {
            require(!m.depositedA, "playerA already deposited");
            m.depositedA = true;
        } else {
            require(!m.depositedB, "playerB already deposited");
            m.depositedB = true;
        }

        // Refund any accidental overpayment immediately rather than
        // silently keeping it — keeps player balances predictable.
        let overpaid: Int = context().value - m.stake;
        if (overpaid > 0) {
            send(SendParameters{
                to: s,
                value: overpaid,
                bounce: false,
                mode: SendIgnoreErrors,
            });
        }

        if (m.depositedA && m.depositedB) {
            m.status = STATUS_ACTIVE;
        }

        self.matches.set(msg.matchId, m);
    }

    receive(msg: DeclareResult) {
        let m: Match = self.matches.get(msg.matchId)!!;

        require(sender() == self.oracle, "only oracle");
        require(m.status == STATUS_ACTIVE, "match not active");

        let pot: Int = m.stake * 2;
        let fee: Int = pot * FEE_BPS / 10000;
        let payout: Int = pot - fee;

        // Effects before interactions: mark resolved BEFORE sending any
        // value, so this branch can never execute twice for one match —
        // even if an outbound message later bounces.
        m.status = STATUS_RESOLVED;
        self.matches.set(msg.matchId, m);

        if (msg.winner == null) {
            // Draw: split the pot evenly, fee still applies.
            let half: Int = payout / 2;
            send(SendParameters{ to: m.playerA, value: half, bounce: true, mode: SendIgnoreErrors });
            send(SendParameters{ to: m.playerB, value: payout - half, bounce: true, mode: SendIgnoreErrors });
        } else {
            let w: Address = msg.winner!!;
            require(w == m.playerA || w == m.playerB, "winner not a player in this match");
            send(SendParameters{ to: w, value: payout, bounce: true, mode: SendIgnoreErrors });
        }

        if (fee > 0) {
            send(SendParameters{ to: self.treasury, value: fee, bounce: false, mode: SendIgnoreErrors });
        }
    }

    // Anyone may trigger this once the deposit window has closed with
    // fewer than two deposits — refunds whoever did pay in. Guards
    // against a match being silently abandoned by one side.
    receive(msg: CancelExpired) {
        let m: Match = self.matches.get(msg.matchId)!!;

        require(m.status == STATUS_WAITING, "match not cancellable");
        require(now() > m.depositDeadline, "deposit window still open");

        m.status = STATUS_CANCELLED;
        self.matches.set(msg.matchId, m);

        if (m.depositedA) {
            send(SendParameters{ to: m.playerA, value: m.stake, bounce: true, mode: SendIgnoreErrors });
        }
        if (m.depositedB) {
            send(SendParameters{ to: m.playerB, value: m.stake, bounce: true, mode: SendIgnoreErrors });
        }
    }

    // Safety net: if both players deposited but the oracle never
    // declares a result (backend outage, bug, or worse), funds must
    // not be permanently stuck. Anyone can trigger a no-fee 50/50
    // refund once resolveDeadline has passed. This is the concrete
    // on-chain guarantee behind "the server never holds your money".
    receive(msg: ForceSplit) {
        let m: Match = self.matches.get(msg.matchId)!!;

        require(m.status == STATUS_ACTIVE, "match not active");
        require(now() > m.resolveDeadline, "resolve deadline not reached yet");

        m.status = STATUS_RESOLVED;
        self.matches.set(msg.matchId, m);

        send(SendParameters{ to: m.playerA, value: m.stake, bounce: true, mode: SendIgnoreErrors });
        send(SendParameters{ to: m.playerB, value: m.stake, bounce: true, mode: SendIgnoreErrors });
    }

    // ------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------

    get fun match_(matchId: Int): Match? {
        return self.matches.get(matchId);
    }

    get fun oracle_(): Address {
        return self.oracle;
    }

    get fun treasury_(): Address {
        return self.treasury;
    }
}
