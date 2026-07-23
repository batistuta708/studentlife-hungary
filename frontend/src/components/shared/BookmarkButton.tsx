"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { bookmarksApi } from "@/lib/api/bookmarks";
import { useAuth } from "@/lib/hooks/useAuth";

interface Props {
  targetType: "Article" | "Job" | "Accommodation";
  targetId: string;
}

export function BookmarkButton({ targetType, targetId }: Props) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);
  const [pending, setPending] = useState(false);
  const [checked, setChecked] = useState(false);

  // On mount, check whether this item is already saved — a brief extra request, but
  // it means the button shows the correct state on page load instead of always
  // starting unchecked regardless of the user's actual saved items.
  useEffect(() => {
    if (!isAuthenticated) {
      setChecked(true);
      return;
    }
    bookmarksApi
      .getMine(targetType)
      .then((res) => {
        const match = res.data.some((b: any) => b.targetId?._id === targetId || b.targetId === targetId);
        setBookmarked(match);
      })
      .finally(() => setChecked(true));
  }, [isAuthenticated, targetType, targetId]);

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (pending) return;

    setPending(true);
    setBookmarked((prev) => !prev); // optimistic
    try {
      const { data } = await bookmarksApi.toggle(targetType, targetId);
      setBookmarked(data.bookmarked);
    } catch {
      setBookmarked((prev) => !prev); // roll back on failure
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!checked}
      aria-label={bookmarked ? "Remove bookmark" : "Save bookmark"}
      className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      <Bookmark size={18} className={bookmarked ? "fill-brand-blue text-brand-blue" : "text-slate-400"} />
      {bookmarked ? "Saved" : "Save"}
    </button>
  );
}