import "./Badge.scss";
import clsx from "clsx";

type Variant = "default" | "success" | "warning" | "danger" | "muted";

type Props = {
    text: string;
    variant?: Variant;
};

export function Badge({ text, variant = "default" }: Props) {

    return (
        <span className={clsx("r64-badge", variant)}>
            {text}
        </span>
    );
}
