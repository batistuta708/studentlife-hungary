import { apiClient } from "./client";
import type { ApiSuccess, User } from "@/types";

interface AuthPayload {
  user: User;
  accessToken: string;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post<ApiSuccess<AuthPayload>>("/auth/register", data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiSuccess<AuthPayload>>("/auth/login", data).then((r) => r.data),

  googleLogin: (idToken: string) =>
    apiClient.post<ApiSuccess<AuthPayload>>("/auth/google", { idToken }).then((r) => r.data),

  logout: () => apiClient.post("/auth/logout"),

  refreshToken: () => apiClient.post<ApiSuccess<{ accessToken: string }>>("/auth/refresh-token").then((r) => r.data),

  verifyEmail: (token: string) => apiClient.post("/auth/verify-email", { token }),

  forgotPassword: (email: string) => apiClient.post("/auth/forgot-password", { email }),

  resetPassword: (data: { token: string; password: string }) => apiClient.post("/auth/reset-password", data),

  getMyProfile: () => apiClient.get<ApiSuccess<User>>("/users/me").then((r) => r.data),

  updateMyProfile: (data: Partial<User>) => apiClient.patch<ApiSuccess<User>>("/users/me", data).then((r) => r.data),
};
