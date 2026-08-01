import { Card, Stack, Text, Loader } from "@/shared/ui";

import { useAuthStore } from "@/features/auth/auth-store";
import { API_URL } from "@/shared/api/http";

export function LoginPage() {

    const loading = useAuthStore((s) => s.loading);
    const error = useAuthStore((s) => s.error);

    return (

        <Card>

            <Stack gap={20}>

                <Text variant="h1">
                    Royal64
                </Text>

                {loading && (
                    <Stack gap={8}>
                        <Loader />
                        <Text variant="small">
                            Signing you in...
                        </Text>
                    </Stack>
                )}

                {error && (
                    <Stack gap={8}>
                        <Text variant="small">
                            {error}
                        </Text>
                        <Text variant="small" mono>
                            API_URL: {API_URL}
                        </Text>
                    </Stack>
                )}

            </Stack>

        </Card>

    );

}
