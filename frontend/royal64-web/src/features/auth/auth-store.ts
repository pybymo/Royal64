import { create } from "zustand";
import type { AuthState, User } from "@/shared/types/auth";

interface Store extends AuthState {
    login(user: User): void;
    logout(): void;
    setLoading(value: boolean): void;
    setError(message: string | null): void;
}

export const useAuthStore = create<Store>((set) => ({
    isAuthenticated: false,
    loading: false,
    error: null,
    user: null,

    login(user) {
        set({
            isAuthenticated: true,
            user,
            loading: false,
            error: null,
        });
    },

    logout() {
        set({
            isAuthenticated: false,
            user: null,
        });
    },

    setLoading(value) {
        set({
            loading: value,
        });
    },

    setError(message) {
        set({
            error: message,
            loading: false,
        });
    },
}));
