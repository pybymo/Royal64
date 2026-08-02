import { Link } from "react-router-dom";

import { BoardThemePicker, Button, Card, Stack, Text } from "@/shared/ui";
import { useAuthStore } from "@/features/auth/auth-store";
import { useBoardThemeStore } from "@/features/game/board-theme-store";
import { useSoundStore } from "@/shared/audio/sound-store";

export function SettingsPage() {

    const user = useAuthStore((s) => s.user);

    const boardTheme = useBoardThemeStore((s) => s.theme);
    const setBoardTheme = useBoardThemeStore((s) => s.setTheme);

    const soundEnabled = useSoundStore((s) => s.enabled);
    const toggleSound = useSoundStore((s) => s.toggle);

    return (

        <Stack gap={20}>

            <Text variant="h2" display>
                Settings
            </Text>

            <Card>
                <Stack gap={12}>
                    <Text variant="h3">Account</Text>
                    <Text variant="small">
                        {user?.username ? `@${user.username}` : "Not signed in"}
                    </Text>
                    <Text variant="small">
                        Account details come from your Telegram profile and
                        can't be edited here.
                    </Text>
                </Stack>
            </Card>

            <Card>
                <Stack gap={14}>
                    <Text variant="h3">Board Theme</Text>
                    <BoardThemePicker value={boardTheme} onChange={setBoardTheme} />
                </Stack>
            </Card>

            <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text variant="h3">Move Sounds</Text>
                    <button
                        type="button"
                        onClick={toggleSound}
                        style={{
                            width: 52,
                            height: 30,
                            borderRadius: 999,
                            background: soundEnabled ? "var(--gradient-gold)" : "var(--surface-2)",
                            border: soundEnabled ? "none" : "1px solid var(--border-strong)",
                            position: "relative",
                            transition: "background .15s ease",
                        }}
                    >
                        <span
                            style={{
                                position: "absolute",
                                top: 3,
                                left: soundEnabled ? 25 : 3,
                                width: 22,
                                height: 22,
                                borderRadius: 999,
                                background: soundEnabled ? "#1A1305" : "var(--text-muted)",
                                transition: "left .15s ease",
                            }}
                        />
                    </button>
                </div>
            </Card>

            <Link to="/wallet">
                <Button variant="secondary" style={{ width: "100%" }}>
                    Manage Wallet
                </Button>
            </Link>

        </Stack>

    );

}
