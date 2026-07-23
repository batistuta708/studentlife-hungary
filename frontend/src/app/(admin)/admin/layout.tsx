"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Newspaper,
  Briefcase,
  Home as HomeIcon,
  GraduationCap,
  Award,
  Tags,
  MessageSquare,
  Mail,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["editor", "admin"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["admin"] },
  { href: "/admin/articles", label: "Articles", icon: Newspaper, roles: ["editor", "admin"] },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase, roles: ["editor", "admin"] },
  { href: "/admin/accommodation", label: "Accommodation", icon: HomeIcon, roles: ["editor", "admin"] },
  { href: "/admin/universities", label: "Universities", icon: GraduationCap, roles: ["editor", "admin"] },
  { href: "/admin/scholarships", label: "Scholarships", icon: Award, roles: ["editor", "admin"] },
  { href: "/admin/categories", label: "Categories", icon: Tags, roles: ["editor", "admin"] },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare, roles: ["editor", "admin"] },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail, roles: ["admin"] },
];

// Role-gated: edge middleware (middleware.ts) already blocks visitors with no session
// cookie at all; this adds the finer-grained editor/admin role check that middleware
// can't do (roles live in Mongo, not in the cookie).
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user && !["editor", "admin"].includes(user.role)) {
      router.replace("/");
    } else if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, user, router]);

  if (!user || !["editor", "admin"].includes(user.role)) return null;

  const visibleLinks = links.filter((l) => l.roles.includes(user.role));

  return (
    <div className="flex min-h-[80vh]">
      <aside className="w-60 shrink-0 border-r border-slate-200 px-3 py-6 dark:border-slate-800">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</p>
        <nav className="mt-4 space-y-1">
          {visibleLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 px-6 py-8">{children}</div>
    </div>
  );
}
