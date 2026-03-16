import type { BaseResponse } from "@/types/APIResponse";
import type { LoginRequest } from "@/types/Auth";
import { axiosNETClient } from "./client";
import type { User } from "@/types/User";

export async function login(
  request: LoginRequest,
): Promise<BaseResponse<null>> {
  const res = await axiosNETClient.post("/api/v1/auth/login/remain", request);
  return res.data;
}

export async function getMe(): Promise<BaseResponse<User>> {
  const res = await axiosNETClient.get("/api/v1/users/me");
  return res.data;
}

export async function logout(): Promise<BaseResponse<null>> {
  const res = await axiosNETClient.post("/api/v1/auth/logout");
  return res.data;
}
