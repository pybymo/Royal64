import { Stack } from "@/shared/ui";

import { Header } from "@/widgets/header";
import { BottomNavigation } from "@/widgets/bottomnavigation";

import { WalletCard } from "@/features/wallet";

import { DashboardActions } from "./DashboardActions";
import { RecentGames } from "./RecentGames";
import { OnlinePlayers } from "./OnlinePlayers";

import { OfferList } from "@/features/matchmaking";


export function Dashboard() {

    return (

        <Stack gap={20}>

            <Header />

            <WalletCard />

            <DashboardActions />

            <OfferList />

            <RecentGames />

            <OnlinePlayers />

            <BottomNavigation />

        </Stack>

    );

}