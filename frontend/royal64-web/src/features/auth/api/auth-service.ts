import { api } from "@/shared/api/http";
import type { User } from "@/entities/user";

export async function health() {
    return api("/health");
}

export async function loginAsGuest(): Promise<User> {

    return {

        id: 1,

        username: "guest",

        displayName: "Guest",

        rating: 1200,

    };

}