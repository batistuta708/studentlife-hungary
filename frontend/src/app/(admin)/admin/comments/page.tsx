"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import type { Comment } from "@/types";

const statusVariant: Record<string, "warning" | "success" | "danger" | "neutral"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  spam: "danger",
};

export default function ManageCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const load = () => adminApi.listComments(filter || undefined).then((res) => setComments(res.data));

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatus = async (id: string, status: string) => {
    await adminApi.updateCommentStatus(id, status);
    load();
  };

  const columns: Column<Comment>[] = [
    { header: "Author", accessor: (c) => c.author?.name || "Unknown" },
    { header: "Comment", accessor: (c) => <span className="line-clamp-2 max-w-md">{c.content}</span> },
    { header: "Status", accessor: (c) => <Badge variant={statusVariant[c.status]}>{c.status}</Badge> },
    { header: "Date", accessor: (c) => new Date(c.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Comments</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input max-w-[160px]">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="spam">Spam</option>
        </select>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={comments}
          loading={loading}
          rowKey={(c) => c._id}
          emptyMessage="No comments match this filter."
          actions={(c) => (
            <div className="flex justify-end gap-2">
              {c.status !== "approved" && (
                <button onClick={() => handleStatus(c._id, "approved")} className="text-xs font-medium text-emerald-600">
                  Approve
                </button>
              )}
              {c.status !== "rejected" && (
                <button onClick={() => handleStatus(c._id, "rejected")} className="text-xs font-medium text-rose-600">
                  Reject
                </button>
              )}
              <button onClick={() => handleStatus(c._id, "spam")} className="text-xs font-medium text-slate-400">
                Spam
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
