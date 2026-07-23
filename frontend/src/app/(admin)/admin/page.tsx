"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { adminApi } from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import type { ChartPoint } from "@/components/admin/EventsChart";

// ssr:false is required (Recharts measures the DOM to size itself and can't render
// server-side), and it also means Recharts' JS is a separate chunk fetched only when
// this section actually mounts — the stat cards above render immediately without
// waiting on it.
const EventsChart = dynamic(() => import("@/components/admin/EventsChart").then((m) => m.EventsChart), {
  ssr: false,
  loading: () => <div className="flex h-72 items-center justify-center text-sm text-slate-400">Loading chart...</div>,
});

interface Summary {
  counts: Record<string, number>;
  eventsPerDay: { _id: { date: string; eventType: string }; count: number }[];
  topArticles: { title: string; views: number; likesCount: number }[];
}

const statLabels: Record<string, string> = {
  totalUsers: "Total Users",
  totalArticles: "Articles",
  publishedArticles: "Published Articles",
  totalJobs: "Total Jobs",
  pendingJobs: "Pending Jobs",
  totalAccommodation: "Total Listings",
  pendingAccommodation: "Pending Listings",
  totalScholarships: "Scholarships",
  pendingComments: "Pending Comments",
};

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    adminApi.getDashboardSummary().then((res) => setSummary(res.data));
  }, []);

  if (!summary) return <p className="text-sm text-slate-400">Loading dashboard...</p>;

  const chartData: ChartPoint[] = Object.values(
    summary.eventsPerDay.reduce<Record<string, ChartPoint>>((acc, e) => {
      const date = e._id.date;
      acc[date] = acc[date] || { date, events: 0 };
      acc[date].events += e.count;
      return acc;
    }, {})
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Object.entries(summary.counts).map(([key, value]) => (
          <Card key={key}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{statLabels[key] || key}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <p className="font-semibold">Events — last 30 days</p>
        <div className="mt-4 h-72">
          <EventsChart data={chartData} />
        </div>
      </Card>

      <Card className="mt-8">
        <p className="font-semibold">Top Articles</p>
        <div className="mt-4 space-y-2">
          {summary.topArticles.map((a) => (
            <div key={a.title} className="flex items-center justify-between text-sm">
              <span>{a.title}</span>
              <span className="text-slate-400">
                {a.views} views · {a.likesCount} likes
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}