import { useEffect } from "react";

import { getTelegramInitData, loginWithTelegram } from "./auth-service";
import { useAuthStore } from "./auth-store";
import { useSessionStore } from "./session-store";

export function AuthProvider() {

    const login = useAuthStore((s) => s.login);
    const setLoading = useAuthStore((s) => s.setLoading);
    const setError = useAuthStore((s) => s.setError);

    const setSession = useSessionStore((s) => s.setSession);

    useEffect(() => {

        async function run() {

            setLoading(true);

            const webApp = (window as any).Telegram?.WebApp;

            // Telegram shows its own loading UI over the Mini App until
            // ready() is called — skipping this is a real reason a
            // Mini App can sit on a spinner far longer than the page
            // itself actually takes to load. expand() just requests
            // full height instead of the collapsed default.
            if (webApp) {
                webApp.ready();
                webApp.expand();
            }

            const initData = getTelegramInitData();

            if (!initData) {
                setLoading(false);
                setError("Open this app from the Royal64 Telegram bot to sign in.");
                return;
            }

            try {
                const { accessToken, user } = await loginWithTelegram(initData);

                setSession({ accessToken });
                login(user);

            } catch (err) {

                setLoading(false);

                setError(
                    err instanceof Error ? err.message : "Sign-in failed"
                );
            }
        }

        run();

    }, [login, setLoading, setError, setSession]);

    return null;
}
