"use client";

import { useEffect, useState } from "react";
import { articlesApi } from "@/lib/api/articles";
import { adminApi } from "@/lib/api/admin";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Article } from "@/types";

const statusVariant: Record<Article["status"], "warning" | "success" | "danger" | "neutral"> = {
  draft: "neutral",
  "pending-review": "warning",
  published: "success",
  archived: "neutral",
};

export default function ManageArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [cover, setCover] = useState<{ url: string; publicId: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => articlesApi.list({ limit: 100, sort: "-createdAt" } as any).then((res) => setArticles(res.data));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id: string, status: string) => {
    await adminApi.updateStatus("articles", id, status);
    load();
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setExcerpt("");
    setContent("");
    setCover(null);
  };

  const startEdit = (a: Article) => {
    setEditingId(a._id);
    setTitle(a.title);
    setExcerpt(a.excerpt);
    setContent(a.content);
    setCover({ url: a.coverImage.url, publicId: "" });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cover) return;
    setSaving(true);
    try {
      const payload = { title, excerpt, content, coverImage: { url: cover.url, alt: title } };
      if (editingId) {
        await articlesApi.update(editingId, payload);
      } else {
        await articlesApi.create(payload);
      }
      resetForm();
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    await articlesApi.remove(id);
    load();
  };

  const columns: Column<Article>[] = [
    { header: "Title", accessor: (a) => a.title },
    { header: "Status", accessor: (a) => <Badge variant={statusVariant[a.status]}>{a.status}</Badge> },
    { header: "Views", accessor: (a) => a.views },
    { header: "Published", accessor: (a) => (a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : "—") },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Articles</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowForm((s) => !s);
          }}
        >
          {showForm ? "Cancel" : "New Article"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="text-sm font-medium">Cover image</label>
            <div className="mt-1 max-w-md">
              <ImageUploader folder="articles" value={cover} onChange={setCover} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input mt-1" required />
          </div>
          <div>
            <label className="text-sm font-medium">Excerpt</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="input mt-1" maxLength={300} required />
          </div>
          <div>
            <label className="text-sm font-medium">Content (HTML)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input mt-1 min-h-[200px]" required />
          </div>
          <Button type="submit" isLoading={saving}>
            {editingId ? "Save changes" : "Save as Draft"}
          </Button>
        </form>
      )}

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={articles}
          loading={loading}
          rowKey={(a) => a._id}
          actions={(a) => (
            <div className="flex flex-wrap justify-end gap-2">
              <button onClick={() => startEdit(a)} className="text-xs font-medium text-brand-blue">
                Edit
              </button>
              {a.status !== "published" && (
                <button onClick={() => handleStatus(a._id, "published")} className="text-xs font-medium text-emerald-600">
                  Publish
                </button>
              )}
              {a.status !== "archived" && (
                <button onClick={() => handleStatus(a._id, "archived")} className="text-xs font-medium text-slate-400">
                  Archive
                </button>
              )}
              <button onClick={() => handleDelete(a._id)} className="text-xs font-medium text-rose-600">
                Delete
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}