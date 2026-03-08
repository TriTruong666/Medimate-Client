import type { BaseResponse, DemoUser } from "@/types/APIResponse";
import { axiosNETClient } from "./client";

export async function demoService(): Promise<BaseResponse<DemoUser[]>> {
  const res = await axiosNETClient.get(`/api/v1/users`);
  return res.data;
}
