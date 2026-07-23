import { apiClient } from "./client";
import type { ApiSuccess, Comment } from "@/types";

export const commentsApi = {
  getForTarget: (targetType: string, targetId: string) =>
    apiClient.get<ApiSuccess<Comment[]>>(`/comments/target/${targetType}/${targetId}`).then((r) => r.data),

  create: (data: { content: string; targetType: string; targetId: string; parentComment?: string }) =>
    apiClient.post<ApiSuccess<Comment>>("/comments", data).then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/comments/${id}`),

  toggleLike: (id: string) => apiClient.post(`/comments/${id}/like`),
};
