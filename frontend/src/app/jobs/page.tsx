import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { BookmarkButton } from "@/components/shared/BookmarkButton";
import { Badge } from "@/components/ui/Badge";
import { jobsApi } from "@/lib/api/jobs";

export const metadata: Metadata = {
  title: "Student Jobs in Hungary",
  description: "Part-time, full-time, and internship opportunities for international students in Hungary.",
};

export const revalidate = 120;

interface Props {
  searchParams: Promise<{ page?: string; search?: string; employmentType?: string; city?: string }>;
}

const employmentTypes = ["part-time", "full-time", "internship", "freelance", "seasonal"];

export default async function JobsPage({ searchParams }: Props) {
  const params = await searchParams; // Next.js 15: searchParams is async and must be awaited
  const page = Number(params.page) || 1;

  let jobs: Awaited<ReturnType<typeof jobsApi.list>>["data"] = [];
  let meta: Awaited<ReturnType<typeof jobsApi.list>>["meta"] = undefined;
  let loadFailed = false;

  try {
    const res = await jobsApi.list({
      page,
      limit: 12,
      search: params.search,
      employmentType: params.employmentType,
      "location.city": params.city,
      sort: "-createdAt",
    });
    jobs = res.data;
    meta = res.meta;
  } catch {
    loadFailed = true;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Student Jobs</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Part-time and internship opportunities across Hungary, filtered for international students.
      </p>

      <form className="mt-6 flex flex-wrap gap-3" action="/jobs">
        <input type="search" name="search" defaultValue={params.search} placeholder="Search jobs..." className="input max-w-xs" />
        <select name="employmentType" defaultValue={params.employmentType || ""} className="input max-w-[160px]">
          <option value="">All types</option>
          {employmentTypes.map((t) => (
            <option key={t} value={t}>
              {t.replace("-", " ")}
            </option>
          ))}
        </select>
        <input type="text" name="city" defaultValue={params.city} placeholder="City" className="input max-w-[160px]" />
        <button type="submit" className="btn-primary">
          Filter
        </button>
      </form>

      {loadFailed && (
        <p className="mt-10 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          We couldn't load jobs right now. Please try again shortly.
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        {jobs.map((job) => (
          <Link key={job._id} href={`/jobs/${job.slug}`}>
            <Card hoverable>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {job.company.name} · {job.location.city}
                    {job.location.isRemote && " · Remote"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
          <Badge variant="blue">{job.employmentType.replace("-", " ")}</Badge>
          <BookmarkButton targetType="Job" targetId={job._id} />
        </div>
              </div>
              {job.salary?.min && (
                <p className="mt-3 text-sm font-medium text-brand-orange">
                  {job.salary.min.toLocaleString()}
                  {job.salary.max ? `–${job.salary.max.toLocaleString()}` : ""} {job.salary.currency}/{job.salary.period}
                </p>
              )}
            </Card>
          </Link>
        ))}
      </div>

      {!loadFailed && jobs.length === 0 && <p className="mt-12 text-center text-slate-500">No jobs match your filters.</p>}

      {meta && meta.totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={{ pathname: "/jobs", query: { ...params, page: p } }}
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
