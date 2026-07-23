import { Button, Card, Stack, Text } from "@/shared/ui";

import { loginAsGuest } from "@/features/auth/auth-service";
import { useAuthStore } from "@/features/auth/auth-store";

export function LoginPage() {

    const login = useAuthStore((s) => s.login);

    async function handleGuestLogin() {

        const user = await loginAsGuest();

        login(user);

    }

    function handleTelegramLogin() {

        // TODO
        // Telegram OAuth
        console.log("Telegram Login");

    }

    return (

        <Card>

            <Stack gap={20}>

                <Text>

                    Royal64 Login

                </Text>

                <Button
                    onClick={handleGuestLogin}
                >

                    Login as Guest

                </Button>

                <Button
                    variant="secondary"
                    onClick={handleTelegramLogin}
                >

                    Telegram Login

                </Button>

            </Stack>

        </Card>

    );

}