export interface User {

    id: string;

    username: string | null;

    firstName: string | null;

    lastName: string | null;

    trustScore: number;

    wins: number;

    losses: number;

    draws: number;
}

export interface AuthState {

    isAuthenticated: boolean;

    loading: boolean;

    error: string | null;

    user: User | null;
}
