import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, GraduationCap, Languages, Wallet } from "lucide-react";
import { universitiesApi } from "@/lib/api/universities";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { data: uni } = await universitiesApi.getBySlug(slug);
    return {
      title: uni.name,
      description: uni.description.slice(0, 155),
      alternates: { canonical: `/universities/${uni.slug}` },
      openGraph: { title: uni.name, description: uni.description.slice(0, 155) },
    };
  } catch {
    return { title: "University not found" };
  }
}

export default async function UniversityDetailPage({ params }: Props) {
  const { slug } = await params;
  let uni;
  try {
    ({ data: uni } = await universitiesApi.getBySlug(slug));
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ name: "Universities", url: "/universities" }, { name: uni.name, url: `/universities/${uni.slug}` }]} />

      {uni.coverImage && (
        <div className="relative aspect-video overflow-hidden rounded-2xl">
          <Image src={uni.coverImage} alt={uni.name} fill className="object-cover" priority />
        </div>
      )}

      <h1 className="mt-6 text-2xl font-bold sm:text-3xl">{uni.name}</h1>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <MapPin size={16} /> {uni.city}
        </span>
        <span className="flex items-center gap-1.5">
          <GraduationCap size={16} /> {uni.degreeLevels.join(", ")}
        </span>
        <span className="flex items-center gap-1.5">
          <Languages size={16} /> {uni.languagesOfInstruction.join(", ")}
        </span>
        {uni.tuitionRange?.min && (
          <span className="flex items-center gap-1.5">
            <Wallet size={16} /> {uni.tuitionRange.min.toLocaleString()}
            {uni.tuitionRange.max ? `–${uni.tuitionRange.max.toLocaleString()}` : ""} {uni.tuitionRange.currency}/
            {uni.tuitionRange.period}
          </span>
        )}
      </div>

      <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
        <p>{uni.description}</p>
      </div>

      {uni.fieldsOfStudy.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold">Fields of study</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {uni.fieldsOfStudy.map((f) => (
              <Badge key={f} variant="blue">
                {f}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {uni.scholarshipsAvailable && (
        <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          Scholarships are available for this university.{" "}
          <a href="/scholarships" className="underline">
            Browse scholarships
          </a>
        </p>
      )}

      {uni.website && (
        <a href={uni.website} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8 inline-flex">
          Visit official website
        </a>
      )}
    </div>
  );
}
