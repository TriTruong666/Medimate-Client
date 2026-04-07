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
  memberName?: string;
  availabilityId: string;
  appointmentDate: string;
  status: AppointmentStatus;
  cancelReason: string | null;
  createdAt: string;
}

export interface DoctorAppointmentDetail {
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  cancelReason: string | null;
  createdAt: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar: string | null;
  specialty: string;
  memberId: string;
  memberName: string;
  memberAvatar: string | null;
  memberGender: string;
  memberDateOfBirth: string | null;
}
