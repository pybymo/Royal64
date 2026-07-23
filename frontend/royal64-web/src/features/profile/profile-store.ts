import { create } from "zustand";

import type { Profile } from "@/shared/types/profile";

interface ProfileStore {

    profile: Profile;

    update(profile: Profile): void;

}

export const useProfileStore = create<ProfileStore>((set) => ({

    profile: {

        username: "guest",

        rating: 1200,

        games: 0,

        wins: 0,

        losses: 0,

    },

    update(profile) {

        set({

            profile,

        });

    },

}));