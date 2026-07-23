"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { bookmarksApi } from "@/lib/api/bookmarks";
import { Card } from "@/components/ui/Card";

export default function SavedArticlesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookmarksApi
      .getMine("Article")
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Saved Articles</h1>

      {loading ? (
        <p className="mt-8 text-sm text-slate-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">
          No saved articles yet.{" "}
          <Link href="/blog" className="text-brand-blue">
            Browse the blog
          </Link>{" "}
          and bookmark something to see it here.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) =>
            b.targetId ? (
              <Link key={b._id} href={`/blog/${b.targetId.slug}`}>
                <Card hoverable className="h-full overflow-hidden !p-0">
                  <div className="relative aspect-video">
                    <Image src={b.targetId.coverImage.url} alt={b.targetId.title} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="font-medium leading-snug">{b.targetId.title}</p>
                  </div>
                </Card>
              </Link>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}