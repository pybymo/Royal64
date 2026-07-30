import { useCallback, useEffect, useRef } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";

import {
    requestWalletChallenge,
    verifyWalletConnection,
} from "./wallet-service";
import { useWalletStore } from "./wallet-store";

/**
 * Drives the TON Connect "connect + prove ownership" flow end to end:
 *
 *   1. ask our backend for a one-time nonce
 *   2. attach it to the connect request as `tonProof`
 *   3. open the wallet picker
 *   4. once the wallet responds with a signed proof, send it to the
 *      backend for verification (`/wallet/connect`)
 *
 * The backend is the only party that decides whether the wallet is
 * actually linked — this hook just relays what the wallet returned.
 */
export function useConnectWallet() {

    const [tonConnectUI] = useTonConnectUI();

    const setConnecting = useWalletStore((s) => s.setConnecting);
    const setConnected = useWalletStore((s) => s.setConnected);
    const setError = useWalletStore((s) => s.setError);

    // Guards against handling the same proof twice if onStatusChange
    // fires more than once for the same connection.
    const handledRef = useRef(false);

    useEffect(() => {

        const unsubscribe = tonConnectUI.onStatusChange(async (wallet) => {

            if (!wallet) {
                return;
            }

            const tonProofItem = wallet.connectItems?.tonProof;

            if (!tonProofItem || !("proof" in tonProofItem)) {
                // Connected without a proof (e.g. a restored session) —
                // nothing for the backend to verify here.
                return;
            }

            if (handledRef.current) {
                return;
            }

            handledRef.current = true;

            try {
                const result = await verifyWalletConnection({
                    address: wallet.account.address,
                    network: wallet.account.chain,
                    public_key: wallet.account.publicKey,
                    wallet_state_init: wallet.account.walletStateInit,
                    proof: tonProofItem.proof,
                });

                setConnected(result.address, result.is_verified);

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : "Wallet verification failed"
                );

                await tonConnectUI.disconnect();

            } finally {
                handledRef.current = false;
            }
        });

        return () => unsubscribe();

    }, [tonConnectUI, setConnected, setError]);

    const connect = useCallback(async () => {

        setError(null);
        setConnecting(true);

        try {
            const challenge = await requestWalletChallenge();

            tonConnectUI.setConnectRequestParameters({
                state: "ready",
                value: { tonProof: challenge.payload },
            });

            await tonConnectUI.openModal();

        } catch (err) {

            setConnecting(false);

            setError(
                err instanceof Error
                    ? err.message
                    : "Could not start wallet connection"
            );
        }

    }, [tonConnectUI, setConnecting, setError]);

    const disconnect = useCallback(async () => {

        await tonConnectUI.disconnect();

        useWalletStore.getState().disconnect();

    }, [tonConnectUI]);

    return { connect, disconnect };
}
