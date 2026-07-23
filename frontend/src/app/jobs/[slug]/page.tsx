import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Clock, Wallet, ExternalLink } from "lucide-react";
import { jobsApi } from "@/lib/api/jobs";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { jobPostingJsonLd } from "@/lib/seo/structuredData";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params; // Next.js 15: params is async and must be awaited
    const { data: job } = await jobsApi.getBySlug(slug);
    const title = `${job.title} at ${job.company.name}`;
    const description = job.description.slice(0, 155);

    return {
      title,
      description,
      alternates: { canonical: `/jobs/${job.slug}` },
      openGraph: { title, description, type: "website" },
    };
  } catch {
    return { title: "Job not found" };
  }
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  let job;
  try {
    ({ data: job } = await jobsApi.getBySlug(slug));
  } catch {
    notFound();
  }

  const jsonLd = jobPostingJsonLd(job);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ name: "Jobs", url: "/jobs" }, { name: job.title, url: `/jobs/${job.slug}` }]} />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{job.title}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{job.company.name}</p>
        </div>
        <Badge variant="blue">{job.employmentType.replace("-", " ")}</Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <MapPin size={16} /> {job.location.city}
          {job.location.isRemote && " (Remote OK)"}
        </span>
        {job.salary?.min && (
          <span className="flex items-center gap-1.5">
            <Wallet size={16} />
            {job.salary.min.toLocaleString()}
            {job.salary.max ? `–${job.salary.max.toLocaleString()}` : ""} {job.salary.currency}/{job.salary.period}
          </span>
        )}
        {job.applicationDeadline && (
          <span className="flex items-center gap-1.5">
            <Clock size={16} /> Apply by {new Date(job.applicationDeadline).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
        <p>{job.description}</p>

        {job.responsibilities?.length > 0 && (
          <>
            <h2>Responsibilities</h2>
            <ul>
              {job.responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </>
        )}

        {job.requirements?.length > 0 && (
          <>
            <h2>Requirements</h2>
            <ul>
              {job.requirements.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {job.workPermitRequired && (
        <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          A valid work permit is required for this role. See our{" "}
          <a href="/visa-guide" className="underline">
            Visa Guide
          </a>{" "}
          for details.
        </p>
      )}

      {(job.applicationUrl || job.applicationEmail) && (
        <a
          href={job.applicationUrl || `mailto:${job.applicationEmail}`}
          target={job.applicationUrl ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="btn-primary mt-8 inline-flex gap-2"
        >
          Apply now <ExternalLink size={16} />
        </a>
      )}
    </div>
  );
}
