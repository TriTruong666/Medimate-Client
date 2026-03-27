import type { BaseResponse } from "@/types/APIResponse";
import type { DoctorProfile } from "@/types/DoctorProfile";
import { axiosNETClient } from "./client";

export type SubmitDoctorMeRequest = {
  fullName: string;
  specialty: string;
  currentHospitalName: string;
  avatarImage?: File;
  licenseNumber: string;
  licenseImage?: File[];
  yearsOfExperience: number;
  bio: string;
};

export async function getDoctorMe(): Promise<BaseResponse<DoctorProfile>> {
  const res = await axiosNETClient.get("/api/v1/doctors/me");
  return res.data;
}

export async function submitDoctorMe(
  request: SubmitDoctorMeRequest,
): Promise<BaseResponse<DoctorProfile>> {
  const formData = new FormData();
  formData.append("fullName", request.fullName);
  formData.append("specialty", request.specialty);
  formData.append("currentHospitalName", request.currentHospitalName);
  formData.append("licenseNumber", request.licenseNumber);
  formData.append("yearsOfExperience", String(request.yearsOfExperience));
  formData.append("bio", request.bio);

  if (request.avatarImage) {
    formData.append("avatarImage", request.avatarImage);
  }

  if (request.licenseImage && request.licenseImage.length > 0) {
    request.licenseImage.forEach((file) => {
      formData.append("licenseImage", file);
    });
  }

  const res = await axiosNETClient.post("/api/v1/doctors/me/submit", formData);
  return res.data;
}

export async function updateDoctorMe(
  formData: FormData,
): Promise<BaseResponse<DoctorProfile>> {
  const res = await axiosNETClient.put("/api/v1/doctors/me", formData);
  return res.data;
}

export type ActivateDoctorRequest = {
  doctorId: string;
  verifyCode: number;
};

export async function activateDoctor(
  request: ActivateDoctorRequest,
): Promise<BaseResponse<DoctorProfile>> {
  const res = await axiosNETClient.post("/api/v1/doctors/activate", request);
  return res.data;
}
