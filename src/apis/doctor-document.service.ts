import { cleanQueryParams } from "@/common/query.params";
import type { BasePaginatedResponse, BaseResponse } from "@/types/APIResponse";
import type {
  DoctorDocument,
  GetDoctorDocumentsParams,
  ReviewDoctorDocumentRequest,
} from "@/types/DoctorDocument";
import { axiosNETClient } from "./client";

export async function getDoctorDocuments(
  params: GetDoctorDocumentsParams,
): Promise<BasePaginatedResponse<DoctorDocument[]>> {
  const res = await axiosNETClient.get("/api/v1/doctor-documents", {
    params: cleanQueryParams<GetDoctorDocumentsParams>(params),
  });

  return res.data;
}

export async function reviewDoctorDocument(
  documentId: string,
  payload: ReviewDoctorDocumentRequest,
): Promise<BaseResponse<DoctorDocument>> {
  const res = await axiosNETClient.patch(
    `/api/v1/doctor-documents/${documentId}/review`,
    payload,
  );

  return res.data;
}
