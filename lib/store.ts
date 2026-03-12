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
    token: string | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setInitialized: (cached: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isAuthenticated: false,
    isInitialized: false,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setToken: (token) => {
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
            }
        }
        set({ token });
    },
    setInitialized: (cached) => set({ isInitialized: cached }),
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        set({ user: null, token: null, isAuthenticated: false });
    },
}));
