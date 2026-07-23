import { api } from "@/shared/api/http";

import type { User } from "@/shared/types/auth";

export async function health() {
    return api("/health");
}

export async function loginAsGuest(): Promise<User> {

    // TODO:
    // بعداً این قسمت به Backend متصل می‌شود.

    return {
        id: 1,
        username: "guest",
        firstName: "Guest",
        lastName: "",
        rating: 1200,
    };

}