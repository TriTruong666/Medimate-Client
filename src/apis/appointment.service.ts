import type { BaseResponse } from "@/types/APIResponse";
import type { DoctorAppointment } from "@/types/Appointment";
import { axiosNETClient } from "./client";

export async function getDoctorAppointments(): Promise<BaseResponse<DoctorAppointment[]>> {
  const res = await axiosNETClient.get(`/api/v1/appointments/doctors/me`);
  return res.data;
}
