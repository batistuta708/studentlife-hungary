"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { adminApi } from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";

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

  // Collapse the per-eventType breakdown into a per-day total for a simple bar chart —
  // the raw breakdown is still available in `summary.eventsPerDay` for a more detailed
  // view later if needed.
  const chartData = Object.values(
    summary.eventsPerDay.reduce<Record<string, { date: string; events: number }>>((acc, e) => {
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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="events" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
