import { api, API_URL } from "@/shared/api/http";
import type { User } from "@/shared/types/auth";

interface BackendUser {
    id: string;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    trust_score: number;
    wins: number;
    losses: number;
    draws: number;
}

interface TelegramLoginResponse {
    access_token: string;
    user: BackendUser;
}

function toUser(u: BackendUser): User {

    return {
        id: u.id,
        username: u.username,
        firstName: u.first_name,
        lastName: u.last_name,
        trustScore: u.trust_score,
        wins: u.wins,
        losses: u.losses,
        draws: u.draws,
    };
}

/**
 * Reads the signed initData string Telegram injects into the Mini App
 * webview. Returns null outside of Telegram (e.g. plain browser dev),
 * so callers can fall back to whatever they need for local dev.
 */
export function getTelegramInitData(): string | null {

    const webApp = (window as any).Telegram?.WebApp;

    if (!webApp?.initData) {
        return null;
    }

    return webApp.initData as string;
}

export async function loginWithTelegram(initData: string) {

    const response = await api<TelegramLoginResponse>("/auth/telegram", {
        method: "POST",
        body: JSON.stringify({ init_data: initData }),
    });

    return {
        accessToken: response.access_token,
        user: toUser(response.user),
    };
}

export async function health() {

    return fetch(API_URL + "/health").then((r) => r.json());
}
