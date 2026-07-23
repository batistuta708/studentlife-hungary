import { apiClient } from "./client";
import type { ApiSuccess, Accommodation } from "@/types";
import type { ListParams } from "./articles";

export const accommodationApi = {
  list: (params?: ListParams) =>
    apiClient.get<ApiSuccess<Accommodation[]>>("/accommodation", { params }).then((r) => r.data),
  getBySlug: (slug: string) => apiClient.get<ApiSuccess<Accommodation>>(`/accommodation/${slug}`).then((r) => r.data),
  create: (data: Partial<Accommodation>) =>
    apiClient.post<ApiSuccess<Accommodation>>("/accommodation", data).then((r) => r.data),
  update: (id: string, data: Partial<Accommodation>) =>
    apiClient.patch<ApiSuccess<Accommodation>>(`/accommodation/${id}`, data).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/accommodation/${id}`),
};
