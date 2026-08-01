import "./BoardThemePicker.scss";
import clsx from "clsx";

import { BOARD_THEMES, type BoardThemeId } from "@/shared/theme/boardThemes";

type Props = {
    value: BoardThemeId;
    onChange: (theme: BoardThemeId) => void;
};

export function BoardThemePicker({ value, onChange }: Props) {

    return (

        <div className="r64-theme-picker">

            {Object.values(BOARD_THEMES).map((theme) => (

                <button
                    key={theme.id}
                    type="button"
                    className={clsx("r64-theme-swatch", value === theme.id && "active")}
                    onClick={() => onChange(theme.id)}
                >

                    <span
                        className="r64-theme-swatch-preview"
                        style={{
                            background: `linear-gradient(135deg, ${theme.lightSquare} 50%, ${theme.darkSquare} 50%)`,
                        }}
                    />

                    <span className="r64-theme-swatch-label">
                        {theme.label}
                    </span>

                </button>
            ))}

        </div>

    );
}
