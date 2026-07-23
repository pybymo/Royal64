import type { User } from "@/entities/user";

export interface AuthState {

    isAuthenticated: boolean;

    loading: boolean;

    user: User | null;

}