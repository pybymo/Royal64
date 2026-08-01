import type { CSSProperties } from "react";

export type BoardThemeId = "wood" | "metal" | "glass";

export interface BoardTheme {
    id: BoardThemeId;
    label: string;
    lightSquare: string;
    darkSquare: string;
    /** Extra CSS applied to the board's wrapper element — this is
     * where the "material" actually reads (glass needs translucency +
     * blur, metal needs a cool border, wood needs a warm frame). */
    boardWrapperStyle: CSSProperties;
}

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {

    wood: {
        id: "wood",
        label: "Wood",
        lightSquare: "#E8C99B",
        darkSquare: "#A9744F",
        boardWrapperStyle: {
            border: "10px solid #6B4A32",
            borderRadius: 6,
            boxShadow: "0 8px 24px rgba(60,35,15,.4)",
        },
    },

    metal: {
        id: "metal",
        label: "Metal",
        lightSquare: "#D5D9DE",
        darkSquare: "#7C838C",
        boardWrapperStyle: {
            border: "6px solid #3A3F46",
            borderRadius: 4,
            boxShadow: "0 8px 24px rgba(0,0,0,.5), inset 0 0 0 1px rgba(255,255,255,.08)",
        },
    },

    glass: {
        id: "glass",
        label: "Glass",
        lightSquare: "rgba(210,235,255,0.55)",
        darkSquare: "rgba(80,140,190,0.55)",
        boardWrapperStyle: {
            border: "1px solid rgba(255,255,255,.25)",
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(0,152,234,.25)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
        },
    },
};

/**
 * react-chessboard's `options.squareStyles` takes a per-square map, so
 * a full 64-entry map is built here rather than relying on shorthand
 * dark/light-square props — that keeps this correct regardless of
 * whether a given version exposes such a shorthand.
 */
export function buildSquareStyles(theme: BoardTheme): Record<string, CSSProperties> {

    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const styles: Record<string, CSSProperties> = {};

    for (let rank = 1; rank <= 8; rank++) {
        for (let fileIndex = 0; fileIndex < 8; fileIndex++) {

            const square = `${files[fileIndex]}${rank}`;
            const isLight = (fileIndex + rank) % 2 === 1;

            styles[square] = {
                backgroundColor: isLight ? theme.lightSquare : theme.darkSquare,
            };
        }
    }

    return styles;
}
