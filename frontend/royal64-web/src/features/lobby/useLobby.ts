import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
    acceptOffer,
    createOffer,
    listOffers,
    type CreateOfferInput,
} from "./lobby-service";
import { getCurrentGame } from "@/features/game/game-service";

export function useLobby() {

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [error, setError] = useState<string | null>(null);

    const offers = useQuery({
        queryKey: ["offers"],
        queryFn: listOffers,
        refetchInterval: 5000, // simple polling until we have a live feed
    });

    const create = useMutation({
        mutationFn: (input: CreateOfferInput) => createOffer(input),
        onSuccess: () => {
            setError(null);
            queryClient.invalidateQueries({ queryKey: ["offers"] });
        },
        onError: (err: Error) => setError(err.message),
    });

    const accept = useMutation({
        mutationFn: (offerId: string) => acceptOffer(offerId),
        onSuccess: async (match) => {
            setError(null);
            queryClient.invalidateQueries({ queryKey: ["offers"] });

            const game = await getCurrentGame(match.id);
            navigate(`/game/${game.id}`);
        },
        onError: (err: Error) => setError(err.message),
    });

    return {
        offers: offers.data ?? [],
        loading: offers.isLoading,
        error,
        createOffer: create.mutate,
        creating: create.isPending,
        acceptOffer: accept.mutate,
        accepting: accept.isPending,
    };
}
