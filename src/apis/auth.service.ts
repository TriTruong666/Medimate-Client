import type { BaseResponse } from "@/types/APIResponse";
import type { LoginRequest } from "@/types/Auth";
import { axiosNETClient } from "./client";
import type { User } from "@/types/User";

// Helper: set/clear cookie "token" để backend đọc trong OnMessageReceived
function setAuthCookie(token: string, days = 1) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  // SameSite=Lax để cookie được gửi kèm withCredentials cross-origin
  document.cookie = `token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function clearAuthCookie() {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export async function login(
  request: LoginRequest,
): Promise<BaseResponse<null>> {
  const res = await axiosNETClient.post("/api/v1/auth/login/remain", request);
  // Lưu token vào cookie "token" để backend đọc (OnMessageReceived + SignalR)
  const accessToken = res.data?.data?.token;
  if (accessToken) {
    setAuthCookie(accessToken, 1); // 1 ngày — khớp với ExpirationHours server
  }
  return res.data;
}

export async function getMe(): Promise<BaseResponse<User>> {
  const res = await axiosNETClient.get("/api/v1/users/me");
  return res.data;
}

export async function logout(): Promise<BaseResponse<null>> {
  const res = await axiosNETClient.post("/api/v1/auth/logout");
  // Xóa cookie sau khi logout
  clearAuthCookie();
  return res.data;
}
