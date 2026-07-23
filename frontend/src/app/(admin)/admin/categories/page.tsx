"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Category } from "@/types";

const appliesToOptions = ["article", "job", "accommodation", "university", "scholarship"] as const;

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [appliesTo, setAppliesTo] = useState<(typeof appliesToOptions)[number]>("article");
  const [creating, setCreating] = useState(false);

  const load = () => adminApi.listCategories().then((res) => setCategories(res.data));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await adminApi.createCategory({ name, appliesTo });
      setName("");
      load();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? This cannot be undone.")) return;
    await adminApi.deleteCategory(id);
    load();
  };

  const columns: Column<Category>[] = [
    { header: "Name", accessor: (c) => c.name },
    { header: "Slug", accessor: (c) => c.slug },
    { header: "Applies To", accessor: (c) => <Badge variant="blue">{c.appliesTo}</Badge> },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Manage Categories</h1>

      <form onSubmit={handleCreate} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input mt-1 max-w-[200px]" placeholder="e.g. Visa & Permits" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Applies to</label>
          <select value={appliesTo} onChange={(e) => setAppliesTo(e.target.value as any)} className="input mt-1 max-w-[160px]">
            {appliesToOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" isLoading={creating}>
          Add Category
        </Button>
      </form>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={categories}
          loading={loading}
          rowKey={(c) => c._id}
          actions={(c) => (
            <button onClick={() => handleDelete(c._id)} className="text-xs font-medium text-rose-600">
              Delete
            </button>
          )}
        />
      </div>
    </div>
  );
}
