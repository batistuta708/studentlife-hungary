"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bookmarksApi } from "@/lib/api/bookmarks";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function SavedJobsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookmarksApi
      .getMine("Job")
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Saved Jobs</h1>

      {loading ? (
        <p className="mt-8 text-sm text-slate-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">
          No saved jobs yet.{" "}
          <Link href="/jobs" className="text-brand-blue">
            Browse jobs
          </Link>{" "}
          and bookmark something to see it here.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {items.map((b) =>
            b.targetId ? (
              <Link key={b._id} href={`/jobs/${b.targetId.slug}`}>
                <Card hoverable>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{b.targetId.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {b.targetId.company?.name} · {b.targetId.location?.city}
                      </p>
                    </div>
                    {b.targetId.employmentType && <Badge variant="blue">{b.targetId.employmentType.replace("-", " ")}</Badge>}
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