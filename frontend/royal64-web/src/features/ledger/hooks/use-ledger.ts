import { useQuery } from "@tanstack/react-query";
import { getLedger } from "@/features/ledger";

export function useLedger() {
    return useQuery({
        queryKey: ["ledger"],
        queryFn: getLedger,
    });
}