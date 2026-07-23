"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { commentsApi } from "@/lib/api/comments";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import type { Comment } from "@/types";

export function CommentSection({ targetType, targetId }: { targetType: string; targetId: string }) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    commentsApi
      .getForTarget(targetType, targetId)
      .then((res) => setComments(res.data))
      .finally(() => setLoading(false));
  }, [targetType, targetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await commentsApi.create({ content, targetType, targetId });
      setContent("");
      // Newly submitted comments queue for moderation, so we show a confirmation
      // rather than optimistically inserting a comment the reader can't yet see live.
      alert("Comment submitted — it will appear once approved.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold">Comments ({comments.length})</h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mt-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="input min-h-[100px]"
            maxLength={1000}
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" isLoading={submitting}>
              Post comment
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          <a href="/login" className="text-brand-blue">
            Log in
          </a>{" "}
          to join the discussion.
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Loading comments...</p>
      ) : (
        <div className="mt-6 space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              {comment.author.avatar?.url ? (
                <Image src={comment.author.avatar.url} alt={comment.author.name} width={36} height={36} className="rounded-full" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700" />
              )}
              <div>
                <p className="text-sm font-semibold">{comment.author.name}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-slate-400">No comments yet — be the first!</p>}
        </div>
      )}
    </section>
  );
}
