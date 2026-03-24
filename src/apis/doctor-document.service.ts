import { cleanQueryParams } from "@/common/query.params";
import type { BasePaginatedResponse } from "@/types/APIResponse";
import type { DoctorDocument, GetDoctorDocumentsParams } from "@/types/DoctorDocument";
import { axiosNETClient } from "./client";

export async function getDoctorDocuments(
  params: GetDoctorDocumentsParams,
): Promise<BasePaginatedResponse<DoctorDocument[]>> {
  const res = await axiosNETClient.get("/api/v1/doctor-documents", {
    params: cleanQueryParams<GetDoctorDocumentsParams>(params),
  });

  return res.data;
}
