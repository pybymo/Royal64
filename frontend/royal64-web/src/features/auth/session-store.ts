import { create } from "zustand";

import type { Session } from "@/shared/types/session";

interface SessionStore {

    session: Session | null;

    setSession(session: Session): void;

    clear(): void;

}

export const useSessionStore = create<SessionStore>((set) => ({

    session: null,

    setSession(session) {

        set({ session });

    },

    clear() {

        set({ session: null });

    },

}));