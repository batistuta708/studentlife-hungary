import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { universitiesApi } from "@/lib/api/universities";

export const metadata: Metadata = {
  title: "Universities in Hungary",
  description: "Compare programs, admissions, and scholarships across Hungarian universities.",
};

export const revalidate = 300;

interface Props {
  searchParams: Promise<{ page?: string; search?: string; city?: string }>;
}

export default async function UniversitiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  let universities: Awaited<ReturnType<typeof universitiesApi.list>>["data"] = [];
  let meta: Awaited<ReturnType<typeof universitiesApi.list>>["meta"] = undefined;
  let loadFailed = false;

  try {
    const res = await universitiesApi.list({ page, limit: 12, search: params.search, city: params.city, sort: "name" });
    universities = res.data;
    meta = res.meta;
  } catch {
    loadFailed = true;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Universities</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Compare programs, admissions, and scholarships across Hungary.</p>

      <form className="mt-6 flex flex-wrap gap-3" action="/universities">
        <input type="search" name="search" defaultValue={params.search} placeholder="Search universities..." className="input max-w-xs" />
        <input type="text" name="city" defaultValue={params.city} placeholder="City" className="input max-w-[160px]" />
        <button type="submit" className="btn-primary">
          Filter
        </button>
      </form>

      {loadFailed && (
        <p className="mt-10 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          We couldn't load universities right now. Please try again shortly.
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {universities.map((uni) => (
          <Link key={uni._id} href={`/universities/${uni.slug}`}>
            <Card hoverable className="h-full">
              {uni.coverImage && (
                <div className="relative -m-5 mb-4 aspect-video overflow-hidden rounded-t-2xl">
                  <Image src={uni.coverImage} alt={uni.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              )}
              <p className="font-semibold leading-snug">{uni.name}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{uni.city}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {uni.degreeLevels.slice(0, 3).map((d) => (
                  <Badge key={d} variant="blue">
                    {d}
                  </Badge>
                ))}
                {uni.scholarshipsAvailable && <Badge variant="success">Scholarships</Badge>}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {!loadFailed && universities.length === 0 && (
        <p className="mt-12 text-center text-slate-500">No universities match your search.</p>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={{ pathname: "/universities", query: { ...params, page: p } }}
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
