import { useEffect } from "react";
import { useAuthStore } from "../model/auth-store";

export function AuthProvider() {

    const setLoading = useAuthStore((s) => s.setLoading);

    useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    return null;
}