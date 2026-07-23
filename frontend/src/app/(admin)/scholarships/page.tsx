"use client";

import { useEffect, useState } from "react";
import { scholarshipsApi } from "@/lib/api/scholarships";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Scholarship } from "@/types";

const coverageOptions = ["full-tuition", "partial-tuition", "living-stipend", "full-ride", "travel-grant"];
const degreeLevelOptions = ["bachelor", "master", "phd", "exchange"];

const statusVariant: Record<string, "warning" | "success" | "neutral"> = {
  upcoming: "warning",
  open: "success",
  closed: "neutral",
};

export default function ManageScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [description, setDescription] = useState("");
  const [coverageType, setCoverageType] = useState("full-ride");
  const [isFullyFunded, setIsFullyFunded] = useState(false);
  const [amountValue, setAmountValue] = useState<number | "">("");
  const [eligibleDegreeLevels, setEligibleDegreeLevels] = useState<string[]>(["bachelor"]);
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [status, setStatus] = useState("open");

  const load = () => scholarshipsApi.list({ limit: 100 }).then((res) => setScholarships(res.data));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setProvider("");
    setDescription("");
    setCoverageType("full-ride");
    setIsFullyFunded(false);
    setAmountValue("");
    setEligibleDegreeLevels(["bachelor"]);
    setApplicationDeadline("");
    setApplicationUrl("");
    setStatus("open");
  };

  const startEdit = (s: Scholarship) => {
    setEditingId(s._id);
    setTitle(s.title);
    setProvider(s.provider);
    setDescription(s.description);
    setCoverageType(s.coverageType);
    setIsFullyFunded(s.amount?.isFullyFunded || false);
    setAmountValue(s.amount?.value || "");
    setEligibleDegreeLevels(s.eligibleDegreeLevels);
    setApplicationDeadline(s.applicationDeadline.slice(0, 10));
    setApplicationUrl(s.applicationUrl);
    setStatus(s.status);
    setShowForm(true);
  };

  const toggleDegreeLevel = (level: string) => {
    setEligibleDegreeLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title,
      provider,
      description,
      coverageType: coverageType as Scholarship["coverageType"],
      amount: { isFullyFunded, value: amountValue === "" ? undefined : Number(amountValue), currency: "HUF" },
      eligibleDegreeLevels: eligibleDegreeLevels as Scholarship["eligibleDegreeLevels"],
      applicationDeadline: new Date(applicationDeadline).toISOString(),
      applicationUrl,
      status: status as Scholarship["status"],
    };
    try {
      if (editingId) {
        await scholarshipsApi.update(editingId, payload);
      } else {
        await scholarshipsApi.create(payload);
      }
      resetForm();
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this scholarship? This cannot be undone.")) return;
    await scholarshipsApi.remove(id);
    load();
  };

  const columns: Column<Scholarship>[] = [
    { header: "Title", accessor: (s) => s.title },
    { header: "Provider", accessor: (s) => s.provider },
    { header: "Deadline", accessor: (s) => new Date(s.applicationDeadline).toLocaleDateString() },
    { header: "Status", accessor: (s) => <Badge variant={statusVariant[s.status]}>{s.status}</Badge> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Scholarships</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowForm((s) => !s);
          }}
        >
          {showForm ? "Cancel" : "New Scholarship"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input mt-1" required />
            </div>
            <div>
              <label className="text-sm font-medium">Provider</label>
              <input value={provider} onChange={(e) => setProvider(e.target.value)} className="input mt-1" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input mt-1 min-h-[100px]" required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Coverage type</label>
              <select value={coverageType} onChange={(e) => setCoverageType(e.target.value)} className="input mt-1">
                {coverageOptions.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input mt-1">
                <option value="upcoming">upcoming</option>
                <option value="open">open</option>
                <option value="closed">closed</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isFullyFunded} onChange={(e) => setIsFullyFunded(e.target.checked)} />
            Fully funded
          </label>
          {!isFullyFunded && (
            <div>
              <label className="text-sm font-medium">Amount (HUF)</label>
              <input
                type="number"
                value={amountValue}
                onChange={(e) => setAmountValue(e.target.value === "" ? "" : Number(e.target.value))}
                className="input mt-1"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Eligible degree levels</label>
            <div className="mt-2 flex flex-wrap gap-3">
              {degreeLevelOptions.map((level) => (
                <label key={level} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={eligibleDegreeLevels.includes(level)} onChange={() => toggleDegreeLevel(level)} />
                  {level}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Application deadline</label>
              <input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="input mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Application URL</label>
              <input
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                className="input mt-1"
                placeholder="https://..."
                required
              />
            </div>
          </div>
          <Button type="submit" isLoading={saving}>
            {editingId ? "Save changes" : "Create scholarship"}
          </Button>
        </form>
      )}

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={scholarships}
          loading={loading}
          rowKey={(s) => s._id}
          actions={(s) => (
            <div className="flex justify-end gap-2">
              <button onClick={() => startEdit(s)} className="text-xs font-medium text-brand-blue">
                Edit
              </button>
              <button onClick={() => handleDelete(s._id)} className="text-xs font-medium text-rose-600">
                Delete
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}