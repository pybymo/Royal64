import type { PropsWithChildren } from "react";
import "./Text.scss";
import clsx from "clsx";

type Props = PropsWithChildren<{

    variant?:
    |"h1"
    |"h2"
    |"h3"
    |"body"
    |"small";

    /** Switches to the monospace face — TON amounts, wallet addresses,
     * clocks, and other figures. */
    mono?:boolean;

    /** Renders in Orbitron with the gold gradient fill — headline
     * moments only (splash, victory, section titles), not body copy. */
    display?:boolean;

}>;

export function Text({

    variant="body",

    mono=false,

    display=false,

    children

}:Props){

    return(

        <div className={clsx("r64-text",variant, mono && "mono", display && "display gold-text")}>

            {children}

        </div>

    )

}
