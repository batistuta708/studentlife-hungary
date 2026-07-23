"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Bookmark, Newspaper, Briefcase, Home as HomeIcon, Settings } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

const links = [
  { href: "/dashboard", label: "Overview", icon: User },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
  { href: "/dashboard/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/dashboard/saved-articles", label: "Saved Articles", icon: Newspaper },
  { href: "/dashboard/saved-jobs", label: "Saved Jobs", icon: Briefcase },
  { href: "/dashboard/saved-accommodation", label: "Saved Housing", icon: HomeIcon },
];

// Client-side guard: redirects unauthenticated visitors to /login. Paired with
// middleware.ts, which does the same check at the edge before this even renders,
// so there's no flash-of-protected-content for direct navigations.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <aside className="hidden w-56 shrink-0 md:block">
        <p className="px-3 text-sm font-semibold text-slate-400">Hi, {user?.name?.split(" ")[0]}</p>
        <nav className="mt-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
