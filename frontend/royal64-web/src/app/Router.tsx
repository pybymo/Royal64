import type { ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";

import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { LobbyPage } from "@/pages/lobby";
import { GamePage } from "@/pages/game";
import { HistoryPage } from "@/pages/history";
import { ProfilePage } from "@/pages/profile";
import { WalletPage } from "@/pages/wallet";
import { Dashboard } from "@/features/dashboard";

import { AppLayout } from "./layout/AppLayout";
import { AuthGuard } from "./guards/AuthGuard";

function withLayout(element: ReactNode) {
    return <AppLayout>{element}</AppLayout>;
}

export const router = createBrowserRouter([
    {
        path: "/",
        element: withLayout(<HomePage />),
    },

    {
        path: "/login",
        element: withLayout(<LoginPage />),
    },

    {
        path: "/dashboard",
        element: withLayout(
            <AuthGuard>
                <Dashboard />
            </AuthGuard>
        ),
    },

    {
        path: "/lobby",
        element: withLayout(
            <AuthGuard>
                <LobbyPage />
            </AuthGuard>
        ),
    },

    {
        path: "/game/:gameId",
        element: withLayout(
            <AuthGuard>
                <GamePage />
            </AuthGuard>
        ),
    },

    {
        path: "/profile",
        element: withLayout(
            <AuthGuard>
                <ProfilePage />
            </AuthGuard>
        ),
    },

    {
        path: "/history",
        element: withLayout(
            <AuthGuard>
                <HistoryPage />
            </AuthGuard>
        ),
    },

    {
        path: "/wallet",
        element: withLayout(
            <AuthGuard>
                <WalletPage />
            </AuthGuard>
        ),
    },
]);
