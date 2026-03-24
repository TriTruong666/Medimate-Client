import * as DoctorDocumentService from "@/apis/doctor-document.service";
import type { GetDoctorDocumentsParams } from "@/types/DoctorDocument";
import { useFetch } from "../useFetch";

export function useDoctorDocuments(params: GetDoctorDocumentsParams) {
  return useFetch(["doctor-documents", params], async () =>
    DoctorDocumentService.getDoctorDocuments(params),
  );
}
