import { apiClient } from "./client";

export const contactApi = {
  submit: (data: { name: string; email: string; message: string }) => apiClient.post("/contact", data),
};
