import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articlesApi } from "@/lib/api/articles";
import { Badge } from "@/components/ui/Badge";
import { LikeButton } from "@/components/blog/LikeButton";
import { CommentSection } from "@/components/blog/CommentSection";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { BookmarkButton } from "@/components/shared/BookmarkButton";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { articleJsonLd } from "@/lib/seo/structuredData";

interface Props {
  params: Promise<{ slug: string }>;
}

// Dynamic per-article SEO — this is the pattern every detail page (jobs, accommodation,
// universities, scholarships) follows: fetch once, derive metadata from the same data
// used to render the page (no duplicate fetch).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params; // Next.js 15: params is async and must be awaited
    const { data: article } = await articlesApi.getBySlug(slug);
    const title = article.seo?.metaTitle || article.title;
    const description = article.seo?.metaDescription || article.excerpt;

    return {
      title,
      description,
      alternates: { canonical: `/blog/${article.slug}` },
      openGraph: {
        title,
        description,
        type: "article",
        publishedTime: article.publishedAt,
        authors: [article.author.name],
        images: [{ url: article.coverImage.url }],
      },
      twitter: { card: "summary_large_image", title, description, images: [article.coverImage.url] },
    };
  } catch {
    return { title: "Article not found" };
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  let article;
  try {
    ({ data: article } = await articlesApi.getBySlug(slug));
  } catch {
    notFound();
  }

  const jsonLd = articleJsonLd({
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    author: article.author,
    publishedAt: article.publishedAt,
    slug: article.slug,
  });

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumbs items={[{ name: "Blog", url: "/blog" }, { name: article.title, url: `/blog/${article.slug}` }]} />

      <div className="flex flex-wrap gap-2">
        {article.categories.map((cat) => (
          <Badge key={cat._id} variant="blue">
            {cat.name}
          </Badge>
        ))}
      </div>

      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{article.title}</h1>

      <div className="mt-4 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        {article.author.avatar?.url && (
          <Image src={article.author.avatar.url} alt={article.author.name} width={32} height={32} className="rounded-full" />
        )}
        <span>{article.author.name}</span>
        <span>·</span>
        <span>{article.readingTimeMinutes} min read</span>
        <span>·</span>
        <span>{article.views} views</span>
      </div>

      <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl">
        <Image src={article.coverImage.url} alt={article.coverImage.alt || article.title} fill className="object-cover" priority />
      </div>

      {/* Content is authored HTML from the CMS/admin editor — sanitized server-side before storage */}
      <div
        className="prose prose-slate mt-8 max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <div className="mt-8 flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <Badge key={tag}>#{tag}</Badge>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-y border-slate-200 py-4 dark:border-slate-800">
        <LikeButton articleId={article._id} initialLikesCount={article.likesCount} />
        <div className="flex gap-2">
          <BookmarkButton targetType="Article" targetId={article._id} />
          <ShareButtons title={article.title} />
        </div>
      </div>

      <CommentSection targetType="Article" targetId={article._id} />
    </article>
  );
}
