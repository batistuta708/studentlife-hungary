import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
}

// A first-party, non-httpOnly marker cookie — NOT a security boundary, just lets
// middleware.ts (running server-side, on the frontend's own domain) know a session
// probably exists so it can redirect at the edge instead of flashing protected content.
// The backend's real refreshToken cookie can't be used for this: it's intentionally
// scoped to path=/api/v1/auth (never sent on a plain page navigation to /dashboard),
// and in production the frontend and backend are on entirely different domains anyway
// — a cookie set by one domain is never visible to the other, regardless of path.
// Real enforcement is unchanged: every protected API call still requires a valid
// access token; this cookie only ever gates which page shell gets rendered first.
const AUTH_MARKER_COOKIE = "isAuthed";

// Only `user` is persisted to localStorage (for a snappy logged-in UI on reload) — the
// access token itself is deliberately NOT persisted. On a fresh page load it's
// re-obtained via /auth/refresh-token (using the httpOnly cookie), which is safer than
// storing a bearer token in localStorage where any injected script could read it.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setSession: (user, accessToken) => {
        Cookies.set(AUTH_MARKER_COOKIE, "1", { expires: 30, sameSite: "lax" });
        set({ user, accessToken, isAuthenticated: true });
      },
      setAccessToken: (accessToken) => {
        Cookies.set(AUTH_MARKER_COOKIE, "1", { expires: 30, sameSite: "lax" });
        set({ accessToken, isAuthenticated: true });
      },
      setUser: (user) => set({ user }),
      clearSession: () => {
        Cookies.remove(AUTH_MARKER_COOKIE);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "slh-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
