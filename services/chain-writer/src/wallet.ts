import { TonClient } from "@ton/ton";
import { WalletContractV5R1 } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";

import { env } from "./env.js";

export async function getOracleWallet() {

    const keyPair = await mnemonicToPrivateKey(env.oracleMnemonic);

    // W5 (V5R1) — this is what TON Keeper creates by default now.
    // If your oracle wallet in TON Keeper is an older v4R2 wallet
    // instead, swap this for WalletContractV4.create({...}) — the
    // point is this MUST match whatever wallet version the mnemonic
    // actually belongs to, since address derivation depends on it.
    // A mismatch here derives a different address than your real
    // wallet, silently breaking oracle auth on the contract.
    const wallet = WalletContractV5R1.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
    });

    const client = new TonClient({
        endpoint: env.tonEndpoint,
        apiKey: env.tonApiKey || undefined,
    });

    const contract = client.open(wallet);

    return { client, wallet, contract, keyPair };
}
