import { Card, Stack, Text } from "@/shared/ui";

import { useProfile } from "@/features/profile/use-profile";

export function ProfilePage() {

    const { profile } = useProfile();

    return (

        <Card>

            <Stack gap={20}>

                <Text>

                    {profile.username}

                </Text>

                <Text>

                    Rating : {profile.rating}

                </Text>

                <Text>

                    Games : {profile.games}

                </Text>

                <Text>

                    Wins : {profile.wins}

                </Text>

                <Text>

                    Losses : {profile.losses}

                </Text>

            </Stack>

        </Card>

    );

}