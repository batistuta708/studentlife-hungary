import { apiClient } from "./client";
import type { ApiSuccess, User } from "@/types";

export const adminApi = {
  getDashboardSummary: () => apiClient.get<ApiSuccess<any>>("/analytics/dashboard").then((r) => r.data),

  // Users
  listUsers: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<ApiSuccess<User[]>>("/users", { params }).then((r) => r.data),
  updateUserRole: (id: string, role: string) =>
    apiClient.patch<ApiSuccess<User>>(`/users/${id}/role`, { role }).then((r) => r.data),
  toggleUserActive: (id: string) => apiClient.patch<ApiSuccess<User>>(`/users/${id}/toggle-active`).then((r) => r.data),
  deleteUser: (id: string) => apiClient.delete(`/users/${id}`),

  // Generic status update — used by Jobs, Accommodation, Articles (Approve Listings)
  updateStatus: (resource: "jobs" | "accommodation" | "articles", id: string, status: string) =>
    apiClient.patch(`/${resource}/${id}/status`, { status }),

  // Comments moderation
  listComments: (status?: string) =>
    apiClient.get<ApiSuccess<any[]>>("/comments/admin/all", { params: { status } }).then((r) => r.data),
  updateCommentStatus: (id: string, status: string) => apiClient.patch(`/comments/${id}/status`, { status }),

  // Newsletter
  listSubscribers: (status?: string) =>
    apiClient.get<ApiSuccess<any[]>>("/newsletter/admin/all", { params: { status } }).then((r) => r.data),
  removeSubscriber: (id: string) => apiClient.delete(`/newsletter/admin/${id}`),

  // Categories
  listCategories: () => apiClient.get<ApiSuccess<any[]>>("/categories").then((r) => r.data),
  createCategory: (data: any) => apiClient.post<ApiSuccess<any>>("/categories", data).then((r) => r.data),
  updateCategory: (id: string, data: any) => apiClient.patch<ApiSuccess<any>>(`/categories/${id}`, data).then((r) => r.data),
  deleteCategory: (id: string) => apiClient.delete(`/categories/${id}`),
};
