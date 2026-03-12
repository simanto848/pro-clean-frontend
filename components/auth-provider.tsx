"use client";

import { useEffect } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setInitialized } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.success && res.data.data.user) {
          setUser(res.data.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        // If 401 or network error, they are just not logged in
        setUser(null);
      } finally {
        setInitialized(true);
      }
    };

    initAuth();
  }, [setUser, setInitialized]);

  return <>{children}</>;
}
