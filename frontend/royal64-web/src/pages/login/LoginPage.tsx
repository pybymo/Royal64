import { Button, Loader, Stack, Text } from "@/shared/ui";

import { useAuthStore } from "@/features/auth/auth-store";
import { API_URL } from "@/shared/api/http";

export function LoginPage() {

    const loading = useAuthStore((s) => s.loading);
    const error = useAuthStore((s) => s.error);

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 28,
                padding: "0 24px",
                textAlign: "center",
            }}
        >

            <div
                className="display"
                style={{
                    fontSize: 44,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                }}
            >
                ROYAL<span className="gold-text">64</span>
            </div>

            <Text variant="small">
                NEXT-GEN CHESS EXPERIENCE
            </Text>

            <Stack gap={16}>

                {loading && (
                    <Stack gap={12}>
                        <Loader />
                        <Text variant="small">
                            Signing you in...
                        </Text>
                    </Stack>
                )}

                {error && (
                    <Stack gap={14}>

                        <Text variant="small">
                            {error}
                        </Text>

                        <Button onClick={() => window.location.reload()}>
                            Retry
                        </Button>

                        <Text variant="small" mono>
                            API_URL: {API_URL}
                        </Text>

                    </Stack>
                )}

            </Stack>

        </div>

    );

}
