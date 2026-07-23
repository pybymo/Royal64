import { createBrowserRouter } from "react-router-dom";

import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { ProfilePage } from "@/pages/profile";
import { Dashboard } from "@/features/dashboard";

import { AuthGuard } from "./guards/AuthGuard";

import { WalletPage } from "@/pages/wallet";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },

    {
        path: "/login",
        element: <LoginPage />,
    },

    {
        path: "/dashboard",
        element: (
            <AuthGuard>
                <Dashboard />
            </AuthGuard>
        ),
    },

    {
        path: "/profile",
        element: (
            <AuthGuard>
                <ProfilePage />
            </AuthGuard>
        ),
    },

    {
    path: "/wallet",

    element: (

        <AuthGuard>

            <WalletPage />

        </AuthGuard>

    ),

    },
]);