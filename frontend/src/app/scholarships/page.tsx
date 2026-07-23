import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { scholarshipsApi } from "@/lib/api/scholarships";

export const metadata: Metadata = {
  title: "Scholarships for International Students in Hungary",
  description: "Funding opportunities for every study level — bachelor's, master's, and PhD programs.",
};

export const revalidate = 300;

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

const statusVariant: Record<string, "warning" | "success" | "neutral"> = {
  upcoming: "warning",
  open: "success",
  closed: "neutral",
};

export default async function ScholarshipsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  let scholarships: Awaited<ReturnType<typeof scholarshipsApi.list>>["data"] = [];
  let meta: Awaited<ReturnType<typeof scholarshipsApi.list>>["meta"] = undefined;
  let loadFailed = false;

  try {
    const res = await scholarshipsApi.list({ page, limit: 12, search: params.search, sort: "applicationDeadline" });
    scholarships = res.data;
    meta = res.meta;
  } catch {
    loadFailed = true;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Scholarships</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Funding opportunities for every study level.</p>

      <form className="mt-6 max-w-md" action="/scholarships">
        <input type="search" name="search" defaultValue={params.search} placeholder="Search scholarships..." className="input" />
      </form>

      {loadFailed && (
        <p className="mt-10 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          We couldn't load scholarships right now. Please try again shortly.
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {scholarships.map((s) => (
          <Link key={s._id} href={`/scholarships/${s.slug}`}>
            <Card hoverable className="h-full">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold leading-snug">{s.title}</p>
                <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.provider}</p>
              <p className="mt-3 text-xs text-slate-400">
                Apply by {new Date(s.applicationDeadline).toLocaleDateString()}
              </p>
              {s.amount?.isFullyFunded && (
                <Badge variant="success" className="mt-2">
                  Fully funded
                </Badge>
              )}
            </Card>
          </Link>
        ))}
      </div>

      {!loadFailed && scholarships.length === 0 && (
        <p className="mt-12 text-center text-slate-500">No scholarships match your search.</p>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={{ pathname: "/scholarships", query: { ...params, page: p } }}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                p === meta!.page ? "bg-brand-blue text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
