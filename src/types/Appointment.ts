export type AppointmentStatus =
  | "upcoming"
  | "completed"
  | "cancelled"
  | "in_progress";

export type AppointmentType = "online" | "offline";

export interface DoctorAppointment {
  appointmentId: string;
  doctorId: string;
  memberId: string;
  availabilityId: string;
  appointmentDate: string;
  status: string;
  cancelReason: string | null;
  createdAt: string;
}
