import * as AssetsService from "@/apis/assets.service";
import { useFetch } from "../useFetch";
import type {
  GetDoctorCertificatesParams,
  GetPrescriptionImagesParams,
} from "@/types/Asset";

export function usePrescriptionImagesList(params: GetPrescriptionImagesParams) {
  return useFetch(["prescription-images", params], async () =>
    AssetsService.getPrescriptionImages(params),
  );
}

export function useDoctorCertificatesList(params: GetDoctorCertificatesParams) {
  return useFetch(["doctor-certificates", params], async () =>
    AssetsService.getDoctorCertificates(params),
  );
}