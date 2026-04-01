import type { BaseResponse } from "@/types/APIResponse";
import type { DoctorAppointment } from "@/types/Appointment";
import { axiosNETClient } from "./client";

export async function getDoctorAppointments(): Promise<BaseResponse<DoctorAppointment[]>> {
  const res = await axiosNETClient.get(`/api/v1/appointments/doctors/me`);
  return res.data;
}

export async function updateAppointmentStatus(id: string, status: string): Promise<BaseResponse<any>> {
  const res = await axiosNETClient.put(`/api/v1/appointments/${id}/status`, { status });
  return res.data;
}
