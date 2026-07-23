import { create } from "zustand";
import type { AuthState, User } from "@/shared/types/auth";

interface Store extends AuthState {
    login(user: User): void;
    logout(): void;
    setLoading(value: boolean): void;
}

export const useAuthStore = create<Store>((set) => ({
    isAuthenticated: false,
    loading: false,
    user: null,

    login(user) {
        set({
            isAuthenticated: true,
            user,
            loading: false,
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
}));