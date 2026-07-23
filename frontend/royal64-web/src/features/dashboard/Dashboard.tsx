import { Card, Stack, Text } from "@/shared/ui";

import { WalletCard } from "@/widgets/walletcard";
import { StatsCard } from "@/widgets/statscard";

import { usePing } from "./hooks";

import { Link } from "react-router-dom";

export function Dashboard() {

    const ping = usePing();

    return (

        <Stack gap={24}>

            <WalletCard balance={10.35} />

            <StatsCard title="Wins" value="25" />

            <StatsCard title="Losses" value="8" />

            <StatsCard title="Rating" value="1540" />

            <Card>

                <Text>

                    Backend :

                    {

                        ping.isSuccess

                            ? " Connected"

                            : " Waiting..."

                    }

                </Text>

            </Card>

            <Link to="/wallet">

                Wallet

            </Link>

            <Link to="/profile">

                Profile

            </Link>

        </Stack>

    );

}