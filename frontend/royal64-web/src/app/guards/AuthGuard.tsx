import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth";

export function AuthGuard({ children }: PropsWithChildren) {

    const auth = useAuth();

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}