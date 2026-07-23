import { apiClient } from "./client";
import type { ApiSuccess } from "@/types";

export const bookmarksApi = {
  toggle: (targetType: "Article" | "Job" | "Accommodation", targetId: string) =>
    apiClient
      .post<ApiSuccess<{ bookmarked: boolean }>>("/bookmarks/toggle", { targetType, targetId })
      .then((r) => r.data),

  getMine: (targetType?: "Article" | "Job" | "Accommodation") =>
    apiClient.get<ApiSuccess<any[]>>("/bookmarks", { params: { targetType } }).then((r) => r.data),
};
