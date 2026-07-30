export interface Wallet {

    balance: number;

    locked: number;

    currency: "TON";

    address: string | null;

    isVerified: boolean;

}

export interface WalletChallenge {

    payload: string;

    expiresIn: number;

}
