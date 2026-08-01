import { Link } from "react-router-dom";

import { Button, Card, Stack, Text } from "@/shared/ui";

export function HomePage() {

    return (

        <Card>

            <Stack gap={20}>

                <Text variant="h1">

                    Royal64

                </Text>

                <Text variant="small">

                    Professional Chess Platform

                </Text>

                <Link to="/lobby">

                    <Button>

                        Play

                    </Button>

                </Link>

            </Stack>

        </Card>

    );

}