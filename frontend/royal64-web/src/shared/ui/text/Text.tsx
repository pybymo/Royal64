import "./Text.scss";
import clsx from "clsx";

type Props = React.PropsWithChildren<{

    variant?:

    |"h1"
    |"h2"
    |"h3"
    |"body"
    |"small";

}>;

export function Text({

    variant="body",

    children

}:Props){

    return(

        <div className={clsx("r64-text",variant)}>

            {children}

        </div>

    )

}