import { apiClient } from "./client";
import type { ApiSuccess, Scholarship } from "@/types";
import type { ListParams } from "./articles";

export const scholarshipsApi = {
  list: (params?: ListParams) =>
    apiClient.get<ApiSuccess<Scholarship[]>>("/scholarships", { params }).then((r) => r.data),
  getBySlug: (slug: string) => apiClient.get<ApiSuccess<Scholarship>>(`/scholarships/${slug}`).then((r) => r.data),
  create: (data: Partial<Scholarship>) =>
    apiClient.post<ApiSuccess<Scholarship>>("/scholarships", data).then((r) => r.data),
  update: (id: string, data: Partial<Scholarship>) =>
    apiClient.patch<ApiSuccess<Scholarship>>(`/scholarships/${id}`, data).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/scholarships/${id}`),
};
