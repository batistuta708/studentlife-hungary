import { apiClient } from "./client";
import type { ApiSuccess, Article } from "@/types";

export interface ListParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  fields?: string;
  [key: string]: string | number | undefined; // arbitrary filter fields, e.g. "location.city"
}

export const articlesApi = {
  list: (params?: ListParams) => apiClient.get<ApiSuccess<Article[]>>("/articles", { params }).then((r) => r.data),

  getBySlug: (slug: string) => apiClient.get<ApiSuccess<Article>>(`/articles/${slug}`).then((r) => r.data),

  getFeatured: (limit = 5) =>
    apiClient.get<ApiSuccess<Article[]>>("/articles/featured", { params: { limit } }).then((r) => r.data),

  getPopular: (limit = 5) =>
    apiClient.get<ApiSuccess<Article[]>>("/articles/popular", { params: { limit } }).then((r) => r.data),

  toggleLike: (id: string) =>
    apiClient.post<ApiSuccess<{ liked: boolean; likesCount: number }>>(`/articles/${id}/like`).then((r) => r.data),

  create: (data: Partial<Article>) => apiClient.post<ApiSuccess<Article>>("/articles", data).then((r) => r.data),

  update: (id: string, data: Partial<Article>) =>
    apiClient.patch<ApiSuccess<Article>>(`/articles/${id}`, data).then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/articles/${id}`),
};
