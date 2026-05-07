export type AppointmentStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Completed"
  | "Cancelled"
  | "InProgress";

export type AppointmentPaymentStatus = "Pending" | "Paid" | "Refunded" | "Failed";

export type AppointmentType = "online" | "offline";

export interface DoctorAppointment {
  appointmentId: string;
  doctorId: string;
  memberId: string;
  memberName?: string;
  availabilityId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  paymentStatus: AppointmentPaymentStatus;  // "Pending" | "Paid"
  amount?: number;                           // Phí khám
  clinicId?: string;
  clinicName?: string;                       // Tên phòng khám
  cancelReason: string | null;
  createdAt: string;
}

export interface DoctorAppointmentDetail {
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  paymentStatus: string;     // "Pending" | "Paid"
  amount?: number;           // Phí khám
  cancelReason: string | null;
  createdAt: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar: string | null;
  specialty: string;
  clinicId?: string;
  clinicName?: string;       // Tên phòng khám
  memberId: string;
  memberName: string;
  memberAvatar: string | null;
  memberGender: string;
  memberDateOfBirth: string | null;
}
