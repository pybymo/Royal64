import { create } from "zustand";

import type { Profile } from "@/shared/types/profile";

interface ProfileStore {
    profile: Profile;
}

export const useProfileStore = create<ProfileStore>(() => ({

    profile: {

        id: 1,

        username: "guest",

        displayName: "Guest",

        rating: 1200,

        games: 0,

        wins: 0,

        losses: 0,

    },

}));