import { TonClient } from "@ton/ton";
import { WalletContractV4 } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";

import { env } from "./env.js";

export async function getOracleWallet() {

    const keyPair = await mnemonicToPrivateKey(env.oracleMnemonic);

    const wallet = WalletContractV4.create({
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
