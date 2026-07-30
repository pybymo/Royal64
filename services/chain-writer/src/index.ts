import express from "express";
import { Address } from "@ton/core";
import { z } from "zod";

import { env } from "./env.js";
import { getOracleWallet } from "./wallet.js";
// import { Royal64Escrow } from "./contract.js"; // uncomment once built

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
        const { contract, keyPair } = await getOracleWallet();

        // TODO once contract.ts is wired up:
        // const escrow = client.open(Royal64Escrow.fromAddress(Address.parse(env.escrowAddress)));
        // await escrow.send(contract.sender(keyPair.secretKey), { value: toNano("0.05") }, {
        //     $$type: "CreateMatch",
        //     matchId: BigInt(parsed.data.matchId),
        //     playerA: Address.parse(parsed.data.playerA),
        //     playerB: Address.parse(parsed.data.playerB),
        //     stake: BigInt(parsed.data.stakeNanoTon),
        //     depositDeadline: parsed.data.depositDeadline,
        //     resolveDeadline: parsed.data.resolveDeadline,
        // });

        res.status(501).json({
            error: "contract.ts not wired up yet — see services/chain-writer/README.md",
        });

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

    try {
        // Same pattern as /matches above — send a DeclareResult message
        // once contract.ts is wired up. Left unimplemented on purpose
        // rather than guessed.

        res.status(501).json({
            error: "contract.ts not wired up yet — see services/chain-writer/README.md",
        });

    } catch (err) {
        console.error("declareResult failed", err);
        res.status(502).json({ error: "chain write failed" });
    }
});

app.get("/matches/:matchId", async (req, res) => {

    try {
        // Read-only — call the contract's `match_` getter once wired up.

        res.status(501).json({
            error: "contract.ts not wired up yet — see services/chain-writer/README.md",
        });

    } catch (err) {
        console.error("read match failed", err);
        res.status(502).json({ error: "chain read failed" });
    }
});

app.listen(env.port, () => {
    console.log(`chain-writer listening on :${env.port} (internal only)`);
});
