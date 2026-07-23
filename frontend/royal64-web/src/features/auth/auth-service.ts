import { api } from "@/shared/api/http";

export interface GuestUser {

    id: number;

    username: string;

}

export async function health() {

    return api("/health");

}

export async function loginAsGuest(): Promise<GuestUser> {

    // تا قبل از اتصال Backend فقط Mock

    return {

        id: 1,

        username: "guest",

    };

}