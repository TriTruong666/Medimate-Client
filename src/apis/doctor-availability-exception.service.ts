import { cleanQueryParams } from "@/common/query.params";
import type { BaseResponse } from "@/types/APIResponse";
import type {
  CreateDoctorAvailabilityExceptionBody,
  DoctorAvailabilityException,
  GetDoctorAvailabilityExceptionsQuery,
  UpdateDoctorAvailabilityExceptionBody,
} from "@/types/DoctorAvailabilityException";
import type { BasePaginatedResponse } from "@/types/APIResponse";
import { AxiosError } from "axios";
import { axiosNETClient } from "./client";

type RawDoctorAvailabilityException =
  Partial<DoctorAvailabilityException> & {
    id?: string;
  };

function normalizeException(
  raw: RawDoctorAvailabilityException,
): DoctorAvailabilityException {
  return {
    exceptionId: raw.exceptionId || raw.id || "",
    doctorId: raw.doctorId || "",
    doctorName: raw.doctorName || "",
    date: raw.date || "",
    startTime: raw.startTime || "",
    endTime: raw.endTime || "",
    reason: raw.reason || "",
    status: raw.status || "Pending", // Mặc định là Pending
    isAvailableOverride: raw.isAvailableOverride ?? false,
  };
}

function normalizeTimeSpanOrNull(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = match[3] ? Number(match[3]) : 0;

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function toExceptionRequestPayload(
  request: CreateDoctorAvailabilityExceptionBody | UpdateDoctorAvailabilityExceptionBody,
) {
  return {
    ...request,
    startTime: normalizeTimeSpanOrNull(request.startTime),
    endTime: normalizeTimeSpanOrNull(request.endTime),
  };
}

function shouldRetryWithRequestWrapper(error: unknown): boolean {
  if (!(error instanceof AxiosError)) {
    return false;
  }

  const raw = JSON.stringify(error.response?.data || "").toLowerCase();
  return raw.includes("request field is required");
}

export async function getDoctorAvailabilityExceptions(
  doctorId: string,
): Promise<BaseResponse<DoctorAvailabilityException[]>> {
  const res = await axiosNETClient.get(
    `/api/v1/doctor-availability-exceptions/doctors/${doctorId}`,
  );
  const payload = res.data as BaseResponse<RawDoctorAvailabilityException[]>;

  return {
    ...payload,
    data: (payload.data || []).map(normalizeException),
  };
}

export async function getDoctorAvailabilityExceptionsPaged(
  query: GetDoctorAvailabilityExceptionsQuery,
): Promise<BasePaginatedResponse<DoctorAvailabilityException[]>> {
  const res = await axiosNETClient.get("/api/v1/doctor-availability-exceptions", {
    params: cleanQueryParams(query),
  });

  const payload = res.data as BasePaginatedResponse<RawDoctorAvailabilityException[]>;
  return {
    ...payload,
    data: payload.data
      ? {
        ...payload.data,
        items: (payload.data.items || []).map(normalizeException),
      }
      : null,
  };
}

export async function createDoctorAvailabilityException(
  doctorId: string,
  request: CreateDoctorAvailabilityExceptionBody,
): Promise<BaseResponse<DoctorAvailabilityException>> {
  const payloadBody = toExceptionRequestPayload(request);

  let res;
  try {
    res = await axiosNETClient.post(
      `/api/v1/doctor-availability-exceptions/doctors/${doctorId}`,
      payloadBody,
    );
  } catch (error) {
    if (!shouldRetryWithRequestWrapper(error)) {
      throw error;
    }

    res = await axiosNETClient.post(
      `/api/v1/doctor-availability-exceptions/doctors/${doctorId}`,
      { request: payloadBody },
    );
  }

  const payload = res.data as BaseResponse<RawDoctorAvailabilityException>;

  return {
    ...payload,
    data: payload.data ? normalizeException(payload.data) : null,
  };
}

export async function updateDoctorAvailabilityException(
  id: string,
  request: UpdateDoctorAvailabilityExceptionBody,
): Promise<BaseResponse<DoctorAvailabilityException>> {
  const payloadBody = toExceptionRequestPayload(request);

  let res;
  try {
    res = await axiosNETClient.put(
      `/api/v1/doctor-availability-exceptions/${id}`,
      payloadBody,
    );
  } catch (error) {
    if (!shouldRetryWithRequestWrapper(error)) {
      throw error;
    }

    res = await axiosNETClient.put(
      `/api/v1/doctor-availability-exceptions/${id}`,
      { request: payloadBody },
    );
  }

  const payload = res.data as BaseResponse<RawDoctorAvailabilityException>;

  return {
    ...payload,
    data: payload.data ? normalizeException(payload.data) : null,
  };
}

export async function deleteDoctorAvailabilityException(
  id: string,
): Promise<BaseResponse<null>> {
  const res = await axiosNETClient.delete(
    `/api/v1/doctor-availability-exceptions/${id}`,
  );
  return res.data;
}
