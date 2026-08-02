import { Link } from "react-router-dom";

import { Button, Text } from "@/shared/ui";

export function HomePage() {

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                padding: "0 24px",
                textAlign: "center",
                background: "var(--gradient-bg)",
            }}
        >

            {/* Chess piece silhouette — pure CSS, no image asset */}
            <div
                aria-hidden
                style={{
                    fontSize: 96,
                    filter: "drop-shadow(0 0 30px var(--gold-glow))",
                }}
            >
                ♞
            </div>

            <div
                className="display"
                style={{
                    fontSize: 40,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                }}
            >
                ROYAL<span className="gold-text">64</span>
            </div>

            <Text variant="small">
                NEXT-GEN CHESS EXPERIENCE
            </Text>

            <div style={{ marginTop: 24, width: "100%", maxWidth: 280 }}>
                <Link to="/lobby">
                    <Button style={{ width: "100%" }}>
                        PLAY NOW
                    </Button>
                </Link>
            </div>

        </div>

    );
}
