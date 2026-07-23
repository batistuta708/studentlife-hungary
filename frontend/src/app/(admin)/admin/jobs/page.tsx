"use client";

import { useEffect, useState } from "react";
import { jobsApi } from "@/lib/api/jobs";
import { adminApi } from "@/lib/api/admin";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import type { Job } from "@/types";

const statusVariant: Record<Job["status"], "warning" | "success" | "danger" | "neutral"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  expired: "neutral",
  filled: "neutral",
};

// This "Approve Listings" pattern — fetch all statuses, show a status badge, offer
// Approve/Reject buttons on pending items — is identical across Jobs, Accommodation,
// and Articles (pending-review). Only the API import and status enum change.
export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");

  const load = () => jobsApi.list({ limit: 100, status: filter || undefined } as any).then((res) => setJobs(res.data));

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatus = async (id: string, status: string) => {
    await adminApi.updateStatus("jobs", id, status);
    load();
  };

  const columns: Column<Job>[] = [
    { header: "Title", accessor: (j) => j.title },
    { header: "Company", accessor: (j) => j.company.name },
    { header: "City", accessor: (j) => j.location.city },
    { header: "Type", accessor: (j) => j.employmentType.replace("-", " ") },
    { header: "Status", accessor: (j) => <Badge variant={statusVariant[j.status]}>{j.status}</Badge> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Jobs</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input max-w-[160px]">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
          <option value="filled">Filled</option>
        </select>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={jobs}
          loading={loading}
          rowKey={(j) => j._id}
          emptyMessage="No jobs match this filter."
          actions={(j) =>
            j.status === "pending" ? (
              <div className="flex justify-end gap-2">
                <button onClick={() => handleStatus(j._id, "approved")} className="text-xs font-medium text-emerald-600">
                  Approve
                </button>
                <button onClick={() => handleStatus(j._id, "rejected")} className="text-xs font-medium text-rose-600">
                  Reject
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )
          }
        />
      </div>
    </div>
  );
}
