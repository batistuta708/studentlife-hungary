import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { articlesApi } from "@/lib/api/articles";

export const metadata: Metadata = {
  title: "Blog — Guides for International Students in Hungary",
  description: "Practical guides on visas, housing, jobs, and student life in Hungary.",
};

export const revalidate = 300; // ISR: re-fetch at most every 5 minutes

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams; // Next.js 15: searchParams is async and must be awaited
  const page = Number(params.page) || 1;

  let articles: Awaited<ReturnType<typeof articlesApi.list>>["data"] = [];
  let meta: Awaited<ReturnType<typeof articlesApi.list>>["meta"] = undefined;
  let loadFailed = false;

  try {
    const res = await articlesApi.list({ page, limit: 9, search: params.search, sort: "-publishedAt" });
    articles = res.data;
    meta = res.meta;
  } catch {
    // Backend unreachable or errored — show a friendly message instead of crashing
    // the whole page (a temporary API outage shouldn't take the blog offline).
    loadFailed = true;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Guides and stories for international students living in Hungary.
      </p>

      <form className="mt-6 max-w-md" action="/blog">
        <input
          type="search"
          name="search"
          defaultValue={params.search}
          placeholder="Search articles..."
          className="input"
        />
      </form>

      {loadFailed && (
        <p className="mt-10 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          We couldn't load articles right now. Please try again shortly.
        </p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
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
                <div className="flex flex-wrap gap-2">
                  {article.categories.slice(0, 2).map((cat) => (
                    <Badge key={cat._id} variant="blue">
                      {cat.name}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 font-semibold leading-snug">{article.title}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{article.excerpt}</p>
                <p className="mt-3 text-xs text-slate-400">{article.readingTimeMinutes} min read</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {!loadFailed && articles.length === 0 && (
        <p className="mt-12 text-center text-slate-500">No articles found.</p>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog?page=${p}${params.search ? `&search=${params.search}` : ""}`}
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
