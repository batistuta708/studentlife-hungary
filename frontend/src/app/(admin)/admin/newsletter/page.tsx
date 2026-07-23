"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";

interface Subscriber {
  _id: string;
  email: string;
  status: "pending" | "subscribed" | "unsubscribed";
  interests: string[];
  createdAt: string;
}

const statusVariant: Record<Subscriber["status"], "warning" | "success" | "neutral"> = {
  pending: "warning",
  subscribed: "success",
  unsubscribed: "neutral",
};

export default function NewsletterManagementPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("subscribed");

  const load = () => adminApi.listSubscribers(filter || undefined).then((res) => setSubscribers(res.data));

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    await adminApi.removeSubscriber(id);
    load();
  };

  const columns: Column<Subscriber>[] = [
    { header: "Email", accessor: (s) => s.email },
    { header: "Status", accessor: (s) => <Badge variant={statusVariant[s.status]}>{s.status}</Badge> },
    { header: "Interests", accessor: (s) => s.interests.join(", ") || "—" },
    { header: "Joined", accessor: (s) => new Date(s.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Newsletter</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input max-w-[160px]">
          <option value="">All</option>
          <option value="subscribed">Subscribed</option>
          <option value="pending">Pending confirmation</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={subscribers}
          loading={loading}
          rowKey={(s) => s._id}
          actions={(s) => (
            <button onClick={() => handleRemove(s._id)} className="text-xs font-medium text-rose-600">
              Remove
            </button>
          )}
        />
      </div>
    </div>
  );
}
