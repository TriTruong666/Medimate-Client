import * as AppointmentService from "@/apis/appointment.service";
import { useFetch } from "../useFetch";

export function useDoctorAppointments() {
  return useFetch(["doctor-appointments"], async () =>
    AppointmentService.getDoctorAppointments(),
  );
}
