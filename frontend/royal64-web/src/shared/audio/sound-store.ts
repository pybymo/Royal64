import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SoundStore {
    enabled: boolean;
    toggle(): void;
}

export const useSoundStore = create<SoundStore>()(
    persist(
        (set, get) => ({
            enabled: true,
            toggle: () => set({ enabled: !get().enabled }),
        }),
        {
            name: "royal64-sound-enabled",
        }
    )
);
