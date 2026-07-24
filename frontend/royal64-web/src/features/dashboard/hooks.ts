import { useQuery } from "@tanstack/react-query";

import { health } from "@/features/auth";

export function usePing() {

    return useQuery({

        queryKey: ["health"],

        queryFn: health,

        refetchInterval: 5000,

    });

}