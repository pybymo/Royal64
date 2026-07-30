import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { TonConnectProvider } from "./TonConnectProvider";


const queryClient = new QueryClient();

export function AppProviders({ children }: PropsWithChildren) {

    return (

        <QueryClientProvider client={queryClient}>

            <TonConnectProvider>

                <AuthProvider />

                {children}

            </TonConnectProvider>

        </QueryClientProvider>

    );
}