"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Moon, Sun, User as UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/jobs", label: "Jobs" },
  { href: "/accommodation", label: "Housing" },
  { href: "/universities", label: "Universities" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/visa-guide", label: "Visa Guide" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-blue">
          <span className="rounded-lg bg-brand-blue px-2 py-1 text-sm text-white">SLH</span>
          StudentLife Hungary
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-brand-blue dark:text-slate-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            aria-label="Toggle dark mode"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              {user && ["editor", "admin"].includes(user.role) && (
                <Link href="/admin" className="text-sm font-medium text-brand-blue">
                  Admin Panel
                </Link>
              )}
              <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium">
                <UserIcon size={18} />
                {user?.name?.split(" ")[0]}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Log in
              </Link>
              <Link href="/register">
                <Button className="!py-2">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 px-4 py-4 md:hidden dark:border-slate-800">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <button
              aria-label="Toggle dark mode"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            {!isAuthenticated && (
              <div className="mt-2 flex gap-3">
                <Link href="/login" className="btn-outline flex-1 text-center">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary flex-1 text-center">
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
