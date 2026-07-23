type Props = {

    text:string

}

export function Badge({text}:Props){

    return(

        <span
            style={{

                padding:"4px 10px",

                borderRadius:999,

                background:"var(--primary)",

                color:"white",

                fontSize:12

            }}
        >

            {text}

        </span>

    )

}