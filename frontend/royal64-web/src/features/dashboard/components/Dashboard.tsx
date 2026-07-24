import { Stack } from "@/shared/ui";

import { Header } from "@/widgets/header";
import { BottomNavigation } from "@/widgets/bottomnavigation";

import { WalletCard } from "@/features/wallet";

import { DashboardActions } from "./DashboardActions";
import { RecentGames } from "./RecentGames";
import { ActiveOffers } from "./ActiveOffers";
import { OnlinePlayers } from "./OnlinePlayers";

export function Dashboard() {

    return (

        <Stack gap={20}>

            <Header />

            <WalletCard />

            <DashboardActions />

            <ActiveOffers />

            <RecentGames />

            <OnlinePlayers />

            <BottomNavigation />

        </Stack>

    );

}