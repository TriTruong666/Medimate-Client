export type DoctorVerificationStatus =
  | "Inactive"
  | "Pending"
  | "Verified"
  | "Approved"
  | "Active"
  | "Rejected";

export type DoctorProfile = {
  doctorId: string;
  userId: string;
  fullName?: string | null;
  status: DoctorVerificationStatus | string;
};
