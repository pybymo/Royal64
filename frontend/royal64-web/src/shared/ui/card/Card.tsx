import "./Card.scss";

type Props = React.PropsWithChildren;

export function Card({ children }: Props) {
  return <div className="r64-card">{children}</div>;
}