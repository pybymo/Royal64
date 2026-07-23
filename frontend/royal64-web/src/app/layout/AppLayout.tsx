import type { PropsWithChildren } from "react";
import { Header } from "@/widgets/header";
import { BottomNavigation } from "@/widgets/bottomnavigation";

export function AppLayout({ children }: PropsWithChildren) {
    return (
        <>
            <Header />
            {children}
            <BottomNavigation />
        </>
    );
}