import { Stack } from "@/shared/ui";

import { Header } from "@/widgets/header";
import { BottomNavigation } from "@/widgets/bottomnavigation";

import { DashboardActions } from "./DashboardActions";
import { RecentGames } from "./RecentGames";
import { OnlinePlayers } from "./OnlinePlayers";

import { OfferList } from "@/features/matchmaking";

import { WalletPage } from "@/pages/wallet";


export function Dashboard() {

    return (

        <Stack gap={20}>

            <Header />

            <WalletPage />

            <DashboardActions />

            <OfferList />

            <RecentGames />

            <OnlinePlayers />

            <BottomNavigation />

        </Stack>

    );

}