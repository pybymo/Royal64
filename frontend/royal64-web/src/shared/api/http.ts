import { useSessionStore } from "@/features/auth/session-store";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function api<T>(
    url: string,
    init?: RequestInit
): Promise<T> {

    const accessToken = useSessionStore.getState().session?.accessToken;

    const headers = new Headers(init?.headers);

    headers.set("Content-Type", "application/json");

    if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const r = await fetch(API_URL + url, {
        ...init,
        headers,
    });

    if (!r.ok) {
        throw new Error(await r.text());
    }

    return r.json();
}
