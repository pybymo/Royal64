import express from "express";
import { Address, toNano } from "@ton/core";
import { TonClient } from "@ton/ton";
import { z } from "zod";

import { env } from "./env.js";
import { getOracleWallet } from "./wallet.js";
import { Royal64Escrow } from "./contract.js";

const app = express();
app.use(express.json());

// Internal auth — this service must never be reachable from the public
// internet, but check anyway: defense in depth costs one middleware.
app.use((req, res, next) => {
    if (req.header("x-internal-api-key") !== env.internalApiKey) {
        res.status(401).json({ error: "unauthorized" });
        return;
    }
    next();
});

function openEscrow(client: TonClient) {
    return client.open(
        Royal64Escrow.fromAddress(Address.parse(env.escrowAddress))
    );
}

const createMatchSchema = z.object({
    matchId: z.number().int().nonnegative(),
    playerA: z.string(),
    playerB: z.string(),
    stakeNanoTon: z.string(), // pass as string to avoid JS float precision issues
    depositDeadline: z.number().int(),
    resolveDeadline: z.number().int(),
});

const declareResultSchema = z.object({
    winner: z.string().nullable(), // null => draw
});

app.post("/matches", async (req, res) => {

    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(422).json({ error: parsed.error.flatten() });
        return;
    }

    try {
        const { client, contract, keyPair } = await getOracleWallet();
        const escrow = openEscrow(client);

        await escrow.send(
            contract.sender(keyPair.secretKey),
            { value: toNano("0.05") }, // gas for the contract's own outbound sends later
            {
                $$type: "CreateMatch",
                matchId: BigInt(parsed.data.matchId),
                playerA: Address.parse(parsed.data.playerA),
                playerB: Address.parse(parsed.data.playerB),
                stake: BigInt(parsed.data.stakeNanoTon),
                depositDeadline: parsed.data.depositDeadline,
                resolveDeadline: parsed.data.resolveDeadline,
            }
        );

        // Sending an external message doesn't return a tx hash
        // synchronously the way an RPC call would — the caller (our
        // FastAPI backend) should poll GET /matches/:matchId to
        // confirm the match actually landed on-chain before trusting
        // it exists.
        res.status(202).json({ status: "submitted", matchId: parsed.data.matchId });

    } catch (err) {
        console.error("createMatch failed", err);
        res.status(502).json({ error: "chain write failed" });
    }
});

app.post("/matches/:matchId/resolve", async (req, res) => {

    const parsed = declareResultSchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(422).json({ error: parsed.error.flatten() });
        return;
    }

    const matchId = BigInt(req.params.matchId);

    try {
        const { client, contract, keyPair } = await getOracleWallet();
        const escrow = openEscrow(client);

        await escrow.send(
            contract.sender(keyPair.secretKey),
            { value: toNano("0.1") }, // covers the two/three outbound payout sends
            {
                $$type: "DeclareResult",
                matchId,
                winner: parsed.data.winner ? Address.parse(parsed.data.winner) : null,
            }
        );

        res.status(202).json({ status: "submitted" });

    } catch (err) {
        console.error("declareResult failed", err);
        res.status(502).json({ error: "chain write failed" });
    }
});

app.get("/matches/:matchId", async (req, res) => {

    try {
        const { client } = await getOracleWallet();
        const escrow = openEscrow(client);

        const matchId = BigInt(req.params.matchId);
        const match = await escrow.getMatchInfo(matchId);

        if (!match) {
            res.status(404).json({ error: "not found on-chain" });
            return;
        }

        res.json({
            playerA: match.playerA.toString(),
            playerB: match.playerB.toString(),
            stake: match.stake.toString(),
            status: match.status,
            depositedA: match.depositedA,
            depositedB: match.depositedB,
        });

    } catch (err) {
        console.error("read match failed", err);
        res.status(502).json({ error: "chain read failed" });
    }
});

app.listen(env.port, () => {
    console.log(`chain-writer listening on :${env.port} (internal only)`);
});
