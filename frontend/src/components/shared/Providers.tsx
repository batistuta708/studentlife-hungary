"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { useAuthBootstrap } from "@/lib/hooks/useAuth";

function AuthBootstrap({ children }: { children: ReactNode }) {
  useAuthBootstrap(); // silently refreshes the session on first load; doesn't block render
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthBootstrap>{children}</AuthBootstrap>
    </ThemeProvider>
  );
}
