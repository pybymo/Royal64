import type { CSSProperties, PropsWithChildren } from "react";
import "./Card.scss";
import clsx from "clsx";

type Props = PropsWithChildren<{
    style?: CSSProperties;
    className?: string;
}>;

export function Card({ children, style, className }: Props) {
  return (
    <div className={clsx("r64-card", className)} style={style}>
      {children}
    </div>
  );
}
