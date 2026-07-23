import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Wallet, GraduationCap, ExternalLink } from "lucide-react";
import { scholarshipsApi } from "@/lib/api/scholarships";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

interface Props {
  params: Promise<{ slug: string }>;
}

const statusVariant: Record<string, "warning" | "success" | "neutral"> = {
  upcoming: "warning",
  open: "success",
  closed: "neutral",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { data: s } = await scholarshipsApi.getBySlug(slug);
    return {
      title: `${s.title} — ${s.provider}`,
      description: s.description.slice(0, 155),
      alternates: { canonical: `/scholarships/${s.slug}` },
    };
  } catch {
    return { title: "Scholarship not found" };
  }
}

export default async function ScholarshipDetailPage({ params }: Props) {
  const { slug } = await params;
  let scholarship;
  try {
    ({ data: scholarship } = await scholarshipsApi.getBySlug(slug));
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ name: "Scholarships", url: "/scholarships" }, { name: scholarship.title, url: `/scholarships/${scholarship.slug}` }]}
      />

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold sm:text-3xl">{scholarship.title}</h1>
        <Badge variant={statusVariant[scholarship.status]}>{scholarship.status}</Badge>
      </div>
      <p className="mt-1 text-slate-500 dark:text-slate-400">{scholarship.provider}</p>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Calendar size={16} /> Apply by {new Date(scholarship.applicationDeadline).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1.5">
          <GraduationCap size={16} /> {scholarship.eligibleDegreeLevels.join(", ")}
        </span>
        {scholarship.amount?.isFullyFunded ? (
          <span className="flex items-center gap-1.5">
            <Wallet size={16} /> Fully funded
          </span>
        ) : scholarship.amount?.value ? (
          <span className="flex items-center gap-1.5">
            <Wallet size={16} /> {scholarship.amount.value.toLocaleString()} {scholarship.amount.currency}
          </span>
        ) : null}
      </div>

      <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
        <p>{scholarship.description}</p>
      </div>

      <a
        href={scholarship.applicationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary mt-8 inline-flex gap-2"
      >
        Apply now <ExternalLink size={16} />
      </a>
    </div>
  );
}
