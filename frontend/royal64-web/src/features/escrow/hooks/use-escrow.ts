import { useQuery } from "@tanstack/react-query";

import { getEscrows } from "@/features/escrow";

export function useEscrows() {

    return useQuery({

        queryKey: ["escrows"],

        queryFn: getEscrows,

    });

}