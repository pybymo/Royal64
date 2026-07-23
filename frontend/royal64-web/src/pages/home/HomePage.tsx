import { Link } from "react-router-dom";

import { Button, Card, Stack, Text } from "@/shared/ui";

export function HomePage() {

    return (

        <Card>

            <Stack gap={20}>

                <Text>

                    Royal64

                </Text>

                <Text>

                    Professional Chess Platform

                </Text>

                <Link to="/login">

                    <Button>

                        Play

                    </Button>

                </Link>

            </Stack>

        </Card>

    );

}