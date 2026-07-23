"use client";

import Link from "next/link";
import { Bookmark, Newspaper, Briefcase, Home as HomeIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Card } from "@/components/ui/Card";

const shortcuts = [
  { href: "/dashboard/bookmarks", label: "All Bookmarks", icon: Bookmark },
  { href: "/dashboard/saved-articles", label: "Saved Articles", icon: Newspaper },
  { href: "/dashboard/saved-jobs", label: "Saved Jobs", icon: Briefcase },
  { href: "/dashboard/saved-accommodation", label: "Saved Housing", icon: HomeIcon },
];

export default function DashboardOverviewPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Here's a quick look at your saved content.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shortcuts.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card hoverable className="flex items-center gap-4">
              <div className="rounded-xl bg-brand-blue/10 p-3 text-brand-blue">
                <Icon size={22} />
              </div>
              <p className="font-medium">{label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
