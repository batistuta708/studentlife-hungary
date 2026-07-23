"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { bookmarksApi } from "@/lib/api/bookmarks";
import { Card } from "@/components/ui/Card";

export default function SavedAccommodationPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookmarksApi
      .getMine("Accommodation")
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Saved Housing</h1>

      {loading ? (
        <p className="mt-8 text-sm text-slate-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">
          No saved listings yet.{" "}
          <Link href="/accommodation" className="text-brand-blue">
            Browse accommodation
          </Link>{" "}
          and bookmark something to see it here.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) =>
            b.targetId ? (
              <Link key={b._id} href={`/accommodation/${b.targetId.slug}`}>
                <Card hoverable className="h-full overflow-hidden !p-0">
                  <div className="relative aspect-video">
                    {b.targetId.images?.[0] ? (
                      <Image src={b.targetId.images[0].url} alt={b.targetId.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-400 dark:bg-slate-800">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-medium leading-snug">{b.targetId.title}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{b.targetId.location?.city}</p>
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