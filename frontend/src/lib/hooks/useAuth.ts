"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api/auth";

// On first mount (fresh page load / new tab), there's no access token in memory yet —
// this silently attempts a refresh using the httpOnly cookie so a returning logged-in
// user doesn't see a flash of "logged out" state. Failure just means "not logged in".
export function useAuthBootstrap() {
  const [isReady, setIsReady] = useState(false);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!user) {
        setIsReady(true);
        return;
      }
      try {
        const { data: accessToken } = await authApi.refreshToken();
        if (cancelled) return;
        setAccessToken(accessToken.accessToken);
        const { data: freshUser } = await authApi.getMyProfile();
        if (!cancelled) setUser(freshUser);
      } catch {
        if (!cancelled) useAuthStore.getState().clearSession();
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isReady;
}

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setSession, clearSession } = useAuthStore();

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    setSession(data.user, data.accessToken);
    router.push("/dashboard");
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await authApi.register({ name, email, password });
    setSession(data.user, data.accessToken);
    router.push("/dashboard");
  };

  const logout = async () => {
    await authApi.logout().catch(() => null);
    clearSession();
    router.push("/");
  };

  return { user, isAuthenticated, login, register, logout };
}
