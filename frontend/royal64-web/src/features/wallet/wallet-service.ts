import { api } from "@/shared/api/http";
import type { WalletChallenge } from "@/shared/types/wallet";

export interface TonProofDomain {
    lengthBytes: number;
    value: string;
}

export interface TonProof {
    timestamp: number;
    domain: TonProofDomain;
    signature: string;
    payload: string;
}

export interface WalletConnectPayload {
    address: string;
    network: string;
    public_key?: string;
    wallet_state_init: string;
    proof: TonProof;
}

export interface WalletOut {
    id: string;
    address: string;
    network: string;
    is_default: boolean;
    is_verified: boolean;
    created_at: string;
}

export async function fetchWallet() {

    return {

        balance: 10.35,

        locked: 0,

        currency: "TON" as const,

        address: null,

        isVerified: false,

    };
}

export async function requestWalletChallenge(): Promise<WalletChallenge> {

    const raw = await api<{ payload: string; expires_in: number }>(
        "/wallet/challenge",
        { method: "POST" }
    );

    return {
        payload: raw.payload,
        expiresIn: raw.expires_in,
    };
}

export async function verifyWalletConnection(
    payload: WalletConnectPayload
): Promise<WalletOut> {

    return api<WalletOut>("/wallet/connect", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
