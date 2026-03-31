export type AppointmentStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Completed"
  | "Cancelled"
  | "InProgress";

export type AppointmentType = "online" | "offline";

export interface DoctorAppointment {
  appointmentId: string;
  doctorId: string;
  memberId: string;
  availabilityId: string;
  appointmentDate: string;
  status: AppointmentStatus;
  cancelReason: string | null;
  createdAt: string;
}
