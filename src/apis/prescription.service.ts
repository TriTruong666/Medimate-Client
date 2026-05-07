import type { BaseResponse } from "@/types/APIResponse";
import type {
  CreatePrescriptionRequest,
  PrescriptionByDoctorDto,
  UpdatePrescriptionRequest,
} from "@/types/Prescription";
import { axiosNETClient } from "./client";

const BASE_ROUTE = "/api/v1/doctor-prescriptions";

function normalizePrescriptionId(item: Partial<PrescriptionByDoctorDto> & Record<string, unknown>) {
  return (
    item.id ||
    (typeof item.digitalPrescriptionId === "string" ? item.digitalPrescriptionId : "") ||
    (typeof item.prescriptionId === "string" ? item.prescriptionId : "") ||
    (typeof item.doctorPrescriptionId === "string" ? item.doctorPrescriptionId : "")
  );
}

function pickDate(
  ...values: Array<unknown>
): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return "";
}

function normalizePrescription(
  item: Partial<PrescriptionByDoctorDto> & Record<string, unknown>,
): PrescriptionByDoctorDto {
  const normalizedId = normalizePrescriptionId(item);
  const createdDate = pickDate(item.createdDate, item.createdAt, item.created_time);
  const updatedDate = pickDate(item.updatedDate, item.updatedAt, item.modifiedAt, createdDate);

  return {
    ...(item as PrescriptionByDoctorDto),
    id: normalizedId,
    prescriptionId:
      typeof item.prescriptionId === "string" ? item.prescriptionId : normalizedId,
    doctorPrescriptionId:
      typeof item.doctorPrescriptionId === "string" ? item.doctorPrescriptionId :
      typeof item.digitalPrescriptionId === "string" ? item.digitalPrescriptionId :
      undefined,
    createdDate,
    updatedDate,
    status:
      typeof item.status === "string" && item.status.trim()
        ? item.status
        : "Active",
  };
}

export async function createPrescription(
  doctorId: string,
  body: CreatePrescriptionRequest,
): Promise<BaseResponse<PrescriptionByDoctorDto>> {
  const res = await axiosNETClient.post(`${BASE_ROUTE}/doctors/${doctorId}`, body);
  return {
    ...res.data,
    data: res.data?.data ? normalizePrescription(res.data.data) : res.data?.data,
  };
}

export async function getPrescriptionById(
  id: string,
): Promise<BaseResponse<PrescriptionByDoctorDto>> {
  const res = await axiosNETClient.get(`${BASE_ROUTE}/${id}`);
  return {
    ...res.data,
    data: res.data?.data ? normalizePrescription(res.data.data) : res.data?.data,
  };
}

export async function getPrescriptionsBySession(
  sessionId: string,
): Promise<BaseResponse<PrescriptionByDoctorDto[]>> {
  const res = await axiosNETClient.get(`${BASE_ROUTE}/sessions/${sessionId}`);
  return {
    ...res.data,
    data: Array.isArray(res.data?.data)
      ? res.data.data.map((item: Partial<PrescriptionByDoctorDto> & Record<string, unknown>) =>
          normalizePrescription(item),
        )
      : res.data?.data,
  };
}

export async function updatePrescription(
  id: string,
  body: UpdatePrescriptionRequest,
): Promise<BaseResponse<PrescriptionByDoctorDto>> {
  const res = await axiosNETClient.put(`${BASE_ROUTE}/${id}`, body);
  return {
    ...res.data,
    data: res.data?.data ? normalizePrescription(res.data.data) : res.data?.data,
  };
}
