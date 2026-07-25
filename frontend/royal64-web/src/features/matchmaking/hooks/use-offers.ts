import { useQuery } from "@tanstack/react-query";

import { getOffers } from "@/features/matchmaking";

export function useOffers() {

    return useQuery({

        queryKey: ["offers"],

        queryFn: getOffers,

    });

}