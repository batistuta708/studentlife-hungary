import { apiClient } from "./client";
import type { ApiSuccess, Job } from "@/types";
import type { ListParams } from "./articles";

export const jobsApi = {
  list: (params?: ListParams) => apiClient.get<ApiSuccess<Job[]>>("/jobs", { params }).then((r) => r.data),
  getBySlug: (slug: string) => apiClient.get<ApiSuccess<Job>>(`/jobs/${slug}`).then((r) => r.data),
  create: (data: Partial<Job>) => apiClient.post<ApiSuccess<Job>>("/jobs", data).then((r) => r.data),
  update: (id: string, data: Partial<Job>) => apiClient.patch<ApiSuccess<Job>>(`/jobs/${id}`, data).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/jobs/${id}`),
};

// Accommodation, Universities, and Scholarships APIs follow this exact same shape —
// list/getBySlug/create/update/remove against their respective /api/v1/<resource>
// endpoints — omitted here for brevity but trivial to add by copying this file.
