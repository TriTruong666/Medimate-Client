import type { BaseResponse } from "@/types/APIResponse";
import type { DoctorProfile } from "@/types/DoctorProfile";
import { axiosNETClient } from "./client";

export type UpdateDoctorMeRequest = {
  fullName?: string;
  bio?: string;
};

export async function getDoctorMe(): Promise<BaseResponse<DoctorProfile>> {
  const res = await axiosNETClient.get("/api/v1/doctors/me");
  return res.data;
}

export async function updateDoctorMe(
  request: UpdateDoctorMeRequest,
): Promise<BaseResponse<DoctorProfile>> {
  const res = await axiosNETClient.put("/api/v1/doctors/me", request);
  return res.data;
}
