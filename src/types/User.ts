export type User = {
  userId: string;
  familyId?: string;
  phoneNumber: string;
  fullName: string;
  email: string;
  dateOfBirth: string | null;
  gender: "male" | "female" | null;
  avatarUrl: string | null;
  isActive: boolean;
  isOnline: boolean;
  role: "User" | "Admin" | "DoctorManager" | "Doctor";
  createdAt: string;
};

export type Doctor = {
  fullName: string;
  specialty: string;
  currentHospitalName: string;
  licenseNumber: string;
  licenseImage: string;
  createdAt: string;
};

export type CreateUserRequest = {
  phoneNumber: string;
  fullName: string;
  email: string;
};
