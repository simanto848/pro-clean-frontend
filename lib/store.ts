import { create } from 'zustand';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    setUser: (user: User | null) => void;
    setInitialized: (cached: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setInitialized: (cached) => set({ isInitialized: cached }),
    logout: () => set({ user: null, isAuthenticated: false }),
}));
