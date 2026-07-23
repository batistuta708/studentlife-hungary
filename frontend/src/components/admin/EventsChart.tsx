"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export interface ChartPoint {
  date: string;
  events: number;
}

// Kept as its own component (rather than inline in the dashboard page) specifically so
// it can be loaded via next/dynamic with ssr:false — Recharts is a genuinely heavy
// dependency (it was the single largest contributor to /admin's 232kB First Load JS in
// the production build), and it doesn't render meaningfully server-side anyway, so
// there's no upside to including it in the initial page bundle at all.
export function EventsChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="events" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}