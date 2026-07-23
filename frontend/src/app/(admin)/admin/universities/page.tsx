"use client";

import { useEffect, useState } from "react";
import { universitiesApi } from "@/lib/api/universities";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { University } from "@/types";

const degreeLevelOptions = ["bachelor", "master", "phd", "exchange"];

export default function ManageUniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [fieldsOfStudy, setFieldsOfStudy] = useState("");
  const [degreeLevels, setDegreeLevels] = useState<string[]>(["bachelor"]);
  const [languagesOfInstruction, setLanguagesOfInstruction] = useState("English");
  const [scholarshipsAvailable, setScholarshipsAvailable] = useState(false);
  const [coverImage, setCoverImage] = useState<{ url: string; publicId: string } | null>(null);

  const load = () => universitiesApi.list({ limit: 100 }).then((res) => setUniversities(res.data));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCity("");
    setDescription("");
    setWebsite("");
    setFieldsOfStudy("");
    setDegreeLevels(["bachelor"]);
    setLanguagesOfInstruction("English");
    setScholarshipsAvailable(false);
    setCoverImage(null);
  };

  const startEdit = (uni: University) => {
    setEditingId(uni._id);
    setName(uni.name);
    setCity(uni.city);
    setDescription(uni.description);
    setWebsite(uni.website || "");
    setFieldsOfStudy(uni.fieldsOfStudy.join(", "));
    setDegreeLevels(uni.degreeLevels);
    setLanguagesOfInstruction(uni.languagesOfInstruction.join(", "));
    setScholarshipsAvailable(uni.scholarshipsAvailable);
    setCoverImage(uni.coverImage ? { url: uni.coverImage, publicId: "" } : null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      city,
      description,
      website: website || undefined,
      fieldsOfStudy: fieldsOfStudy.split(",").map((s) => s.trim()).filter(Boolean),
      degreeLevels: degreeLevels as University["degreeLevels"],
      languagesOfInstruction: languagesOfInstruction.split(",").map((s) => s.trim()).filter(Boolean),
      scholarshipsAvailable,
      coverImage: coverImage?.url,
    };
    try {
      if (editingId) {
        await universitiesApi.update(editingId, payload);
      } else {
        await universitiesApi.create(payload);
      }
      resetForm();
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this university? This cannot be undone.")) return;
    await universitiesApi.remove(id);
    load();
  };

  const toggleDegreeLevel = (level: string) => {
    setDegreeLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]));
  };

  const columns: Column<University>[] = [
    { header: "Name", accessor: (u) => u.name },
    { header: "City", accessor: (u) => u.city },
    { header: "Degree Levels", accessor: (u) => u.degreeLevels.join(", ") },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Universities</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowForm((s) => !s);
          }}
        >
          {showForm ? "Cancel" : "New University"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="text-sm font-medium">Cover image</label>
            <div className="mt-1 max-w-md">
              <ImageUploader folder="universities" value={coverImage} onChange={setCoverImage} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" required />
            </div>
            <div>
              <label className="text-sm font-medium">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="input mt-1" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input mt-1 min-h-[120px]" required />
          </div>
          <div>
            <label className="text-sm font-medium">Website</label>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} className="input mt-1" placeholder="https://..." />
          </div>
          <div>
            <label className="text-sm font-medium">Fields of study (comma-separated)</label>
            <input value={fieldsOfStudy} onChange={(e) => setFieldsOfStudy(e.target.value)} className="input mt-1" placeholder="Law, Sciences, IT" />
          </div>
          <div>
            <label className="text-sm font-medium">Languages of instruction (comma-separated)</label>
            <input value={languagesOfInstruction} onChange={(e) => setLanguagesOfInstruction(e.target.value)} className="input mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Degree levels offered</label>
            <div className="mt-2 flex flex-wrap gap-3">
              {degreeLevelOptions.map((level) => (
                <label key={level} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={degreeLevels.includes(level)} onChange={() => toggleDegreeLevel(level)} />
                  {level}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={scholarshipsAvailable} onChange={(e) => setScholarshipsAvailable(e.target.checked)} />
            Scholarships available
          </label>
          <Button type="submit" isLoading={saving}>
            {editingId ? "Save changes" : "Create university"}
          </Button>
        </form>
      )}

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={universities}
          loading={loading}
          rowKey={(u) => u._id}
          actions={(u) => (
            <div className="flex justify-end gap-2">
              <button onClick={() => startEdit(u)} className="text-xs font-medium text-brand-blue">
                Edit
              </button>
              <button onClick={() => handleDelete(u._id)} className="text-xs font-medium text-rose-600">
                Delete
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}