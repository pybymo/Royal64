import { useMatchStore } from "@/features/match";

export function useCurrentMatch() {

    const match = useMatchStore(

        (state) => state.current

    );

    return {

        match,

    };

}