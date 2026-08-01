import "./PromotionPicker.scss";

const PIECES: { code: "q" | "r" | "b" | "n"; label: string }[] = [
    { code: "q", label: "Queen" },
    { code: "r", label: "Rook" },
    { code: "b", label: "Bishop" },
    { code: "n", label: "Knight" },
];

type Props = {
    onSelect: (piece: "q" | "r" | "b" | "n") => void;
};

export function PromotionPicker({ onSelect }: Props) {

    return (

        <div className="r64-promotion-overlay">

            <div className="r64-promotion-dialog">

                <p>Promote to</p>

                <div className="r64-promotion-options">

                    {PIECES.map((piece) => (

                        <button
                            key={piece.code}
                            type="button"
                            onClick={() => onSelect(piece.code)}
                        >
                            {piece.label}
                        </button>
                    ))}

                </div>

            </div>

        </div>

    );
}
