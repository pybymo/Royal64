import { Card, Stack, Text } from "@/shared/ui";

import { useAuthStore } from "@/features/auth/auth-store";

export function LoginPage() {

    const loading = useAuthStore((s) => s.loading);
    const error = useAuthStore((s) => s.error);

    return (

        <Card>

            <Stack gap={20}>

                <Text>
                    Royal64
                </Text>

                {loading && (
                    <Text variant="small">
                        Signing you in...
                    </Text>
                )}

                {error && (
                    <Text variant="small">
                        {error}
                    </Text>
                )}

            </Stack>

        </Card>

    );

}
