"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { articlesApi } from "@/lib/api/articles";
import { useAuth } from "@/lib/hooks/useAuth";

export function LikeButton({ articleId, initialLikesCount }: { articleId: string; initialLikesCount: number }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikesCount);
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (pending) return;

    // Optimistic update — feels instant, rolled back if the request fails.
    setPending(true);
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      const { data } = await articlesApi.toggleLike(articleId);
      setLiked(data.liked);
      setCount(data.likesCount);
    } catch {
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev + 1 : prev - 1));
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      <Heart size={18} className={liked ? "fill-brand-orange text-brand-orange" : "text-slate-400"} />
      {count}
    </button>
  );
}
