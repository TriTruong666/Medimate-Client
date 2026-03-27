import { axiosNETClient } from "./client";
import type { BaseResponse } from "@/types/APIResponse";

export type DoctorAccountStatus = "Pending" | "Rejected" | "Inactive" | "Active" | "Verified";

export type DoctorAccount = {
  doctorId: string;
  fullName: string;
  specialty: string;
  currentHospitalName: string;
  licenseNumber: string;
  licenseImage: string;
  yearsOfExperience: number;
  bio: string;
  averageRating: number;
  status: DoctorAccountStatus;
  rejectionReason: string | null;
  isOnline: boolean;
  lastSeenAt: string;
  createdAt: string;
  userId: string;
};

export type GetManagementDoctorsRequest = {
  specialty?: string;
  status?: string;
};

export async function getDoctors(
  req: GetManagementDoctorsRequest
): Promise<BaseResponse<DoctorAccount[]>> {
  const params = new URLSearchParams();
  if (req.specialty) params.append("Specialty", req.specialty);
  if (req.status) params.append("status", req.status);

  const res = await axiosNETClient.get("/api/v1/management/doctors", { params });
  return res.data;
}

export async function getDoctorById(id: string): Promise<BaseResponse<DoctorAccount>> {
  const res = await axiosNETClient.get(`/api/v1/management/doctors/${id}`);
  return res.data;
}

export async function verifyDoctor(id: string): Promise<BaseResponse<DoctorAccount>> {
  const res = await axiosNETClient.post(`/api/v1/management/doctors/${id}/verify`);
  return res.data;
}

export async function rejectDoctor(id: string, reason: string): Promise<BaseResponse<DoctorAccount>> {
  const res = await axiosNETClient.post(`/api/v1/management/doctors/${id}/reject`, { reason });
  return res.data;
}
