import { useEffect } from "react";
import { useAuthStore } from "./auth-store";

export function AuthProvider() {

    const setLoading = useAuthStore((s) => s.setLoading);

    useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    return null;
}