"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X } from "lucide-react";
import { uploadApi, UploadFolder } from "@/lib/api/upload";

interface Props {
  folder: UploadFolder;
  value?: { url: string; publicId: string } | null;
  onChange: (value: { url: string; publicId: string } | null) => void;
}

export function ImageUploader({ folder, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const { data } = await uploadApi.uploadImage(file, folder, setProgress);
      onChange({ url: data.url, publicId: data.publicId });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (value?.publicId) await uploadApi.deleteImage(value.publicId).catch(() => null);
    onChange(null);
  };

  if (value?.url) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <Image src={value.url} alt="Uploaded image" fill className="object-cover" />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      onDragOver={(e) => e.preventDefault()}
      className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-brand-blue hover:text-brand-blue dark:border-slate-700"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {uploading ? (
        <p className="text-sm">Uploading... {progress}%</p>
      ) : (
        <>
          <UploadCloud size={28} />
          <p className="mt-2 text-sm">Click or drag an image here</p>
        </>
      )}
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
