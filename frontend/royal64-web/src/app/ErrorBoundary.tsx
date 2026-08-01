import { Component, type ErrorInfo, type PropsWithChildren } from "react";

interface State {
    error: Error | null;
}

/**
 * Second layer of defense after the plain-JS catcher in index.html —
 * this one gives a properly styled in-app error screen for React
 * render errors specifically, instead of the raw monospace fallback.
 * Both exist because a WebView with no devtools access (a phone
 * inside Telegram) turns "blank screen" into a dead end otherwise —
 * this makes the actual failure visible no matter which layer catches it.
 */
export class ErrorBoundary extends Component<PropsWithChildren, State> {

    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("Render error caught by ErrorBoundary:", error, info);
    }

    render() {

        if (this.state.error) {

            return (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "#050607",
                        color: "#F5F6F7",
                        fontFamily: "monospace",
                        fontSize: 13,
                        padding: 20,
                        overflow: "auto",
                        whiteSpace: "pre-wrap",
                        zIndex: 99999,
                    }}
                >
                    <h1 style={{ color: "#F23645", fontSize: 16, marginBottom: 12 }}>
                        Something crashed
                    </h1>

                    <div>{this.state.error.message}</div>

                    <div style={{ color: "#5B6169", marginTop: 16, fontSize: 11 }}>
                        {this.state.error.stack}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
