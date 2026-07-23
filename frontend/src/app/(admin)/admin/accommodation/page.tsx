"use client";

import { useEffect, useState } from "react";
import { accommodationApi } from "@/lib/api/accommodation";
import { adminApi } from "@/lib/api/admin";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Accommodation } from "@/types";

const typeOptions = ["dormitory", "studio", "shared-apartment", "private-apartment", "homestay"];

const statusVariant: Record<Accommodation["status"], "warning" | "success" | "danger" | "neutral"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  rented: "neutral",
  expired: "neutral",
};

// Combines the two patterns from Phase 6: moderation (status filter + approve/reject,
// like Jobs) AND a full content-editor form with image upload (like Articles) — since
// admins need both to actually manage this content day to day.
export default function ManageAccommodationPage() {
  const [listings, setListings] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("studio");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState(100000);
  const [availableRooms, setAvailableRooms] = useState(1);
  const [amenities, setAmenities] = useState("");
  const [image, setImage] = useState<{ url: string; publicId: string } | null>(null);

  const load = () =>
    accommodationApi.list({ limit: 100, status: filter || undefined }).then((res) => setListings(res.data));

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatus = async (id: string, status: string) => {
    await adminApi.updateStatus("accommodation", id, status);
    load();
  };

  const resetForm = () => {
    setTitle("");
    setType("studio");
    setDescription("");
    setAddress("");
    setCity("");
    setPrice(100000);
    setAvailableRooms(1);
    setAmenities("");
    setImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setSaving(true);
    try {
      await accommodationApi.create({
        title,
        type: type as Accommodation["type"],
        description,
        location: { address, city },
        price: { amount: price, currency: "HUF", period: "month", utilitiesIncluded: false },
       capacity: { availableRooms, roommates: 0 },
        amenities: amenities.split(",").map((a) => a.trim()).filter(Boolean),
        images: [{ url: image.url, alt: title }],
      });
      resetForm();
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    await accommodationApi.remove(id);
    load();
  };

  const columns: Column<Accommodation>[] = [
    { header: "Title", accessor: (l) => l.title },
    { header: "City", accessor: (l) => l.location.city },
    { header: "Type", accessor: (l) => l.type.replace("-", " ") },
    { header: "Price", accessor: (l) => `${l.price.amount.toLocaleString()} ${l.price.currency}` },
    { header: "Status", accessor: (l) => <Badge variant={statusVariant[l.status]}>{l.status}</Badge> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Accommodation</h1>
        <div className="flex gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input max-w-[160px]">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="rented">Rented</option>
            <option value="expired">Expired</option>
          </select>
          <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cancel" : "New Listing"}</Button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="text-sm font-medium">Photo</label>
            <div className="mt-1 max-w-md">
              <ImageUploader folder="accommodation" value={image} onChange={setImage} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input mt-1" required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="input mt-1">
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t.replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="input mt-1" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="input mt-1" required />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input mt-1 min-h-[100px]" required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Price (HUF/month)</label>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="input mt-1" min={0} />
            </div>
            <div>
              <label className="text-sm font-medium">Available rooms</label>
              <input
                type="number"
                value={availableRooms}
                onChange={(e) => setAvailableRooms(Number(e.target.value))}
                className="input mt-1"
                min={0}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Amenities (comma-separated)</label>
            <input value={amenities} onChange={(e) => setAmenities(e.target.value)} className="input mt-1" placeholder="WiFi, Furnished, Washing machine" />
          </div>
          <Button type="submit" isLoading={saving}>
            Create listing
          </Button>
        </form>
      )}

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={listings}
          loading={loading}
          rowKey={(l) => l._id}
          emptyMessage="No listings match this filter."
          actions={(l) => (
            <div className="flex justify-end gap-2">
              {l.status === "pending" && (
                <>
                  <button onClick={() => handleStatus(l._id, "approved")} className="text-xs font-medium text-emerald-600">
                    Approve
                  </button>
                  <button onClick={() => handleStatus(l._id, "rejected")} className="text-xs font-medium text-rose-600">
                    Reject
                  </button>
                </>
              )}
              <button onClick={() => handleDelete(l._id)} className="text-xs font-medium text-slate-400">
                Delete
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}