import Link from "next/link";
import Image from "next/image";
import { Briefcase, Home as HomeIcon, GraduationCap, Award } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { articlesApi } from "@/lib/api/articles";

const quickLinks = [
  { href: "/jobs", label: "Student Jobs", icon: Briefcase, desc: "Part-time & internships across Hungary" },
  { href: "/accommodation", label: "Accommodation", icon: HomeIcon, desc: "Dorms, studios & shared apartments" },
  { href: "/universities", label: "Universities", icon: GraduationCap, desc: "Compare programs & admissions" },
  { href: "/scholarships", label: "Scholarships", icon: Award, desc: "Funding for every study level" },
];

// Server Component — fetched at request time so featured content stays fresh without
// a client-side loading spinner on the most important above-the-fold section.
export default async function HomePage() {
  let featuredArticles: Awaited<ReturnType<typeof articlesApi.getFeatured>>["data"] = [];
  try {
    const res = await articlesApi.getFeatured(3);
    featuredArticles = res.data;
  } catch {
    featuredArticles = []; // backend not reachable at build/SSR time — render gracefully
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue/10 via-white to-brand-orange/10 py-20 dark:from-brand-blue/20 dark:via-slate-950 dark:to-brand-orange/10">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Your life in Hungary,
            <span className="text-brand-blue"> sorted.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Housing, jobs, scholarships, and every guide you need as an international
            student — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/accommodation">
              <Button>Find Housing</Button>
            </Link>
            <Link href="/jobs">
              <Button variant="outline">Browse Jobs</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map(({ href, label, icon: Icon, desc }) => (
            <Link key={href} href={href}>
              <Card hoverable className="h-full">
                <Icon className="text-brand-blue" size={28} />
                <p className="mt-4 font-semibold">{label}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {featuredArticles.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Guides</h2>
            <Link href="/blog" className="text-sm font-medium text-brand-blue">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredArticles.map((article) => (
              <Link key={article._id} href={`/blog/${article.slug}`}>
                <Card hoverable className="h-full overflow-hidden !p-0">
                  <div className="relative aspect-video">
                    <Image
                      src={article.coverImage.url}
                      alt={article.coverImage.alt || article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <p className="font-semibold">{article.title}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{article.excerpt}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
