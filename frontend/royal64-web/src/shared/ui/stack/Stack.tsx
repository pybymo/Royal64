import "./Stack.scss";
import clsx from "clsx";

type Props = React.PropsWithChildren<{

    gap?:number;

    horizontal?:boolean;

}>;

export function Stack({

    gap=16,

    horizontal=false,

    children

}:Props){

    return(

        <div

            className={clsx(
                "r64-stack",
                horizontal && "horizontal"
            )}

            style={{

                gap

            }}

        >

            {children}

        </div>

    )

}