import "./Button.scss";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  variant = "primary",
  className,
  ...props
}: Props) {
  return (
    <button
      className={clsx("r64-button", variant, className)}
      {...props}
    />
  );
}