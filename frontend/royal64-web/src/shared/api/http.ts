export const API_URL = "http://127.0.0.1:8000";

export async function api<T>(

    url: string,

    init?: RequestInit

): Promise<T> {

    const r = await fetch(API_URL + url, init);

    if (!r.ok) {

        throw new Error(await r.text());

    }

    return r.json();

}