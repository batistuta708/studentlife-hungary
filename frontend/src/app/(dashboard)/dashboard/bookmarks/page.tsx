"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { bookmarksApi } from "@/lib/api/bookmarks";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface BookmarkItem {
  _id: string;
  targetType: "Article" | "Job" | "Accommodation";
  targetId: any; // populated document — shape depends on targetType
}

const linkFor = (b: BookmarkItem) => {
  if (!b.targetId) return "#";
  switch (b.targetType) {
    case "Article":
      return `/blog/${b.targetId.slug}`;
    case "Job":
      return `/jobs/${b.targetId.slug}`;
    case "Accommodation":
      return `/accommodation/${b.targetId.slug}`;
    default:
      return "#";
  }
};

const titleFor = (b: BookmarkItem) => b.targetId?.title || "(removed)";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"" | "Article" | "Job" | "Accommodation">("");

  useEffect(() => {
    setLoading(true);
    bookmarksApi
      .getMine(filter || undefined)
      .then((res) => setBookmarks(res.data))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookmarks</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="input max-w-[180px]">
          <option value="">All types</option>
          <option value="Article">Articles</option>
          <option value="Job">Jobs</option>
          <option value="Accommodation">Accommodation</option>
        </select>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-slate-400">Loading...</p>
      ) : bookmarks.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">
          Nothing bookmarked yet. Browse the{" "}
          <Link href="/blog" className="text-brand-blue">
            blog
          </Link>
          ,{" "}
          <Link href="/jobs" className="text-brand-blue">
            jobs
          </Link>
          , or{" "}
          <Link href="/accommodation" className="text-brand-blue">
            accommodation
          </Link>{" "}
          and tap the bookmark icon to save something here.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {bookmarks.map((b) => (
            <Link key={b._id} href={linkFor(b)}>
              <Card hoverable className="flex items-center gap-4">
                {b.targetId?.coverImage?.url || b.targetId?.images?.[0]?.url ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={b.targetId.coverImage?.url || b.targetId.images[0].url}
                      alt={titleFor(b)}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800" />
                )}
                <div>
                  <Badge variant="blue">{b.targetType}</Badge>
                  <p className="mt-1 font-medium">{titleFor(b)}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}