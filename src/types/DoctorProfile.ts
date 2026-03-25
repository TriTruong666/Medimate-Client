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
  specialty?: string | null;
  currentHospitalName?: string | null;
  avatarUrl?: string | null;
  licenseNumber?: string | null;
  licenseImage?: string | null;
  yearsOfExperience?: number | null;
  bio?: string | null;
  averageRating?: number | null;
  createdAt?: string | null;
  status: DoctorVerificationStatus | string;
};
