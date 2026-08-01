import type { PropsWithChildren } from "react";
import "./Card.scss";

type Props = PropsWithChildren;

export function Card({ children }: Props) {
  return <div className="r64-card">{children}</div>;
}
