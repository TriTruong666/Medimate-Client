import type { BaseResponse } from "@/types/APIResponse";
import type {
  CreateDoctorAvailabilityBody,
  DoctorAvailability,
  UpdateDoctorAvailabilityBody,
} from "@/types/DoctorAvailability";
import { axiosNETClient } from "./client";

type RawAvailability = Partial<DoctorAvailability> & {
  availabilityId?: string;
  doctorAvailabilityId?: string;
};

function normalizeAvailability(raw: RawAvailability): DoctorAvailability {
  return {
    id:
      raw.id ||
      raw.availabilityId ||
      raw.doctorAvailabilityId ||
      "",
    doctorId: raw.doctorId || "",
    dayOfWeek: raw.dayOfWeek || "Monday",
    startTime: raw.startTime || "",
    endTime: raw.endTime || "",
    isActive: raw.isActive ?? true,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function getDoctorAvailabilities(
  doctorId: string,
): Promise<BaseResponse<DoctorAvailability[]>> {
  const res = await axiosNETClient.get(
    `/api/v1/doctor-availabilities/doctors/${doctorId}`,
  );

  const payload = res.data as BaseResponse<RawAvailability[]>;
  return {
    ...payload,
    data: (payload.data || []).map(normalizeAvailability),
  };
}

export async function createDoctorAvailabilities(
  doctorId: string,
  request: CreateDoctorAvailabilityBody[],
): Promise<BaseResponse<DoctorAvailability[]>> {
  const res = await axiosNETClient.post(
    `/api/v1/doctor-availabilities/doctors/${doctorId}`,
    request,
  );
  const payload = res.data as BaseResponse<RawAvailability[]>;
  return {
    ...payload,
    data: (payload.data || []).map(normalizeAvailability),
  };
}

export async function updateDoctorAvailability(
  id: string,
  request: UpdateDoctorAvailabilityBody,
): Promise<BaseResponse<DoctorAvailability>> {
  const res = await axiosNETClient.put(`/api/v1/doctor-availabilities/${id}`, request);
  const payload = res.data as BaseResponse<RawAvailability>;
  return {
    ...payload,
    data: payload.data ? normalizeAvailability(payload.data) : null,
  };
}

export async function deleteDoctorAvailability(
  id: string,
): Promise<BaseResponse<null>> {
  const res = await axiosNETClient.delete(`/api/v1/doctor-availabilities/${id}`);
  
  return res.data;
}
