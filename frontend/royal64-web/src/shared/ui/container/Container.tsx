import "./Container.scss";

type Props = React.PropsWithChildren;

export function Container({ children }: Props) {
    return (
        <div className="r64-container">
            {children}
        </div>
    );
}