import { apiClient } from "./client";
import type { ApiSuccess } from "@/types";

export type UploadFolder = "articles" | "jobs" | "accommodation" | "universities" | "avatars";

export const uploadApi = {
  uploadImage: (file: File, folder: UploadFolder, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append("image", file);

    return apiClient
      .post<ApiSuccess<{ url: string; publicId: string; width: number; height: number }>>(
        `/uploads/${folder}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
          },
        }
      )
      .then((r) => r.data);
  },

  deleteImage: (publicId: string) => apiClient.delete("/uploads", { data: { publicId } }),
};
