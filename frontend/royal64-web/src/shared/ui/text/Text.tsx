import "./Text.scss";
import clsx from "clsx";

type Props = React.PropsWithChildren<{

    variant?:
    |"h1"
    |"h2"
    |"h3"
    |"body"
    |"small";

    /** Switches to the monospace face — use for TON amounts, wallet
     * addresses, clocks, and other figures where a crypto-app reads
     * as more deliberate than plain body text. */
    mono?:boolean;

}>;

export function Text({

    variant="body",

    mono=false,

    children

}:Props){

    return(

        <div className={clsx("r64-text",variant, mono && "mono")}>

            {children}

        </div>

    )

}
