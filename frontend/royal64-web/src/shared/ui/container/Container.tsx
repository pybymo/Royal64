import type { PropsWithChildren } from "react";
import "./Container.scss";

type Props = PropsWithChildren;

export function Container({ children }: Props) {
    return (
        <div className="r64-container">
            {children}
        </div>
    );
}
