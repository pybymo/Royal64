import { Stack } from "@/shared/ui";

import { WalletCard } from "@/features/wallet";

import { Header } from "@/widgets/header";
import { BottomNavigation } from "@/widgets/bottomnavigation";

import { DashboardActions } from "./DashboardActions";

export function Dashboard() {

    return (

        <Stack gap={20}>

            <Header />

            <WalletCard />

            <DashboardActions />

            <BottomNavigation />

        </Stack>

    );

}