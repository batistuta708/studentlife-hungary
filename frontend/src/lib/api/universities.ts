import { apiClient } from "./client";
import type { ApiSuccess, University } from "@/types";
import type { ListParams } from "./articles";

export const universitiesApi = {
  list: (params?: ListParams) =>
    apiClient.get<ApiSuccess<University[]>>("/universities", { params }).then((r) => r.data),
  getBySlug: (slug: string) => apiClient.get<ApiSuccess<University>>(`/universities/${slug}`).then((r) => r.data),
  create: (data: Partial<University>) =>
    apiClient.post<ApiSuccess<University>>("/universities", data).then((r) => r.data),
  update: (id: string, data: Partial<University>) =>
    apiClient.patch<ApiSuccess<University>>(`/universities/${id}`, data).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/universities/${id}`),
};
