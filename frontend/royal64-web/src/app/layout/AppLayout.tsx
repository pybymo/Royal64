import type { PropsWithChildren } from "react";
import { Header } from "@/widgets/header";
import { BottomNavigation } from "@/widgets/bottomnavigation";

export function AppLayout({ children }: PropsWithChildren) {
    return (
        <>
            <Header />

            <main
                style={{
                    padding: "20px 16px 100px",
                    maxWidth: 480,
                    margin: "0 auto",
                }}
            >
                {children}
            </main>

            <BottomNavigation />
        </>
    );
}
