import { useSessionStore } from "@/features/auth/session-store";

export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function api<T>(
    url: string,
    init?: RequestInit
): Promise<T> {

    const accessToken = useSessionStore.getState().session?.accessToken;

    const headers = new Headers(init?.headers);

    headers.set("Content-Type", "application/json");

    // No-op against a normal server; only matters if API_URL points
    // at an ngrok tunnel (e.g. phone testing) — ngrok's free tier
    // otherwise returns its own HTML "visit site" interstitial instead
    // of proxying the request, which looks exactly like "the backend
    // is broken" from here.
    headers.set("ngrok-skip-browser-warning", "true");

    if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    let r: Response;

    try {
        r = await fetch(API_URL + url, {
            ...init,
            headers,
        });

    } catch (err) {
        // A network-level failure (DNS, connection refused, CORS
        // preflight rejected, mixed content) throws a TypeError here
        // with an unhelpful, browser-specific message — WebKit/Safari
        // literally says "Load failed" with zero detail, which reads
        // like the app itself broke rather than "can't reach the API".
        // API_URL is baked in at build time from VITE_API_URL — this
        // is almost always that value being wrong/unreachable, or the
        // backend's CORS_ORIGINS not including this exact origin.
        throw new Error(
            `Could not reach the backend at ${API_URL}${url}. ` +
            `Check that VITE_API_URL points to a reachable, HTTPS backend ` +
            `URL and that the backend's CORS_ORIGINS includes this app's ` +
            `origin (${window.location.origin}). ` +
            `Original error: ${err instanceof Error ? err.message : String(err)}`
        );
    }

    if (!r.ok) {
        throw new Error(await r.text());
    }

    return r.json();
}
