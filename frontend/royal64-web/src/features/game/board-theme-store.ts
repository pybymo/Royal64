import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { BoardThemeId } from "@/shared/theme/boardThemes";

interface BoardThemeStore {
    theme: BoardThemeId;
    setTheme(theme: BoardThemeId): void;
}

export const useBoardThemeStore = create<BoardThemeStore>()(
    persist(
        (set) => ({
            theme: "wood",
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: "royal64-board-theme",
        }
    )
);
