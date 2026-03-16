import type { BaseResponse } from "@/types/APIResponse";
import type { LoginRequest } from "@/types/Auth";
import { axiosNETClient } from "./client";

export async function login(
  request: LoginRequest,
): Promise<BaseResponse<null>> {
  const res = await axiosNETClient.post("/api/v1/auth/login/remain", request);
  return res.data;
}
