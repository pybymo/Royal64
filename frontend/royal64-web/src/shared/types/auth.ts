export interface User {
    id: number;
    username: string;
    firstName: string;
    lastName?: string;
    rating: number;
}

export interface AuthState {
    isAuthenticated: boolean;
    loading: boolean;
    user: User | null;
}