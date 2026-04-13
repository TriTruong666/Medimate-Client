import type { BasePaginatedResponse } from "@/types/APIResponse";
import { axiosNETClient } from "./client";
import type {
  DoctorCertificate,
  GetDoctorCertificatesParams,
  GetPrescriptionImagesParams,
  PrescriptionImage,
} from "@/types/Asset";
import { cleanQueryParams } from "@/common/query.params";

export async function getPrescriptionImages(
  params: GetPrescriptionImagesParams,
): Promise<BasePaginatedResponse<PrescriptionImage[]>> {
  const res = await axiosNETClient.get("/api/cloudinary/images", {
    params: cleanQueryParams<GetPrescriptionImagesParams>({ ...params, pageSize: 10 }),
  });
  return res.data;
}

export async function getDoctorCertificates(
  params: GetDoctorCertificatesParams,
): Promise<BasePaginatedResponse<DoctorCertificate[]>> {
  const res = await axiosNETClient.get("/api/cloudinary/document", {
    params: cleanQueryParams<GetDoctorCertificatesParams>({ ...params, pageSize: 10 }),
  });
  return res.data;
}