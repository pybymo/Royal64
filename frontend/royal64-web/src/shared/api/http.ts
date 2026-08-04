import { useSessionStore } from "@/features/auth/session-store";

export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const REQUEST_TIMEOUT_MS = 15000;

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

    // Without this, a request that never gets a response (tunnel
    // hiccup, backend hung, dropped connection) spins the caller's
    // loading state forever with zero feedback — indistinguishable
    // from "still working on it" to whoever's watching a spinner.
    // 15s is generous for any of this app's actual endpoints.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let r: Response;

    try {
        r = await fetch(API_URL + url, {
            ...init,
            headers,
            signal: controller.signal,
        });

    } catch (err) {

        if (err instanceof DOMException && err.name === "AbortError") {
            throw new Error(
                `Request to ${API_URL}${url} timed out after ${REQUEST_TIMEOUT_MS / 1000}s. ` +
                `The backend didn't respond in time — check it's actually running ` +
                `and reachable at that address.`
            );
        }

        // A network-level failure (DNS, connection refused, CORS
        // preflight rejected, mixed content) throws a TypeError here
        // with an unhelpful, browser-specific message — WebKit/Safari
        // literally says "Load failed" with zero detail. The Fetch API
        // deliberately can't tell "server is down" apart from "CORS is
        // blocking a server that's actually fine" on a normal request
        // (that's a security property, not a gap) — so a no-cors probe
        // is used to find out which one this actually is instead of
        // guessing in the error message.
        const reachable = await probeReachable();

        if (reachable) {
            throw new Error(
                `The backend at ${API_URL} is reachable, but this request was ` +
                `blocked by CORS — the response didn't include this app's ` +
                `origin (${window.location.origin}) in its allowed origins. ` +
                `Check the backend's CORS_ORIGINS setting and that it was ` +
                `restarted after any change to it. ` +
                `Original error: ${err instanceof Error ? err.message : String(err)}`
            );
        }

        throw new Error(
            `Could not reach the backend at all at ${API_URL}${url} — this is a ` +
            `network-level failure, not CORS (confirmed via a no-cors probe). ` +
            `Check VITE_API_URL is the CURRENT tunnel URL (these regenerate on ` +
            `every tunnel restart) and that the backend is actually running. ` +
            `Original error: ${err instanceof Error ? err.message : String(err)}`
        );

    } finally {
        clearTimeout(timeout);
    }

    if (!r.ok) {
        throw new Error(await r.text());
    }

    return r.json();
}

async function probeReachable(): Promise<boolean> {

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        // mode: "no-cors" gets an opaque response instead of throwing
        // on a CORS mismatch — it only rejects if the request couldn't
        // reach a server at all. That's the one thing being checked
        // here; the response content itself is intentionally unusable.
        await fetch(API_URL + "/health", {
            mode: "no-cors",
            signal: controller.signal,
        });

        return true;

    } catch {
        return false;

    } finally {
        clearTimeout(timeout);
    }
}
