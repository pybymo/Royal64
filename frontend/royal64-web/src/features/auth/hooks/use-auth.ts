import { useAuthStore } from "../model/auth-store";

export function useAuth() {
    return useAuthStore();
}