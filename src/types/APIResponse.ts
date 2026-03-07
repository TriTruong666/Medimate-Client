export type DemoUser = {
  userId: string;
  phoneNumber: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  gender: "male" | "female" | null;
  avatarUrl: string;
  isActive: boolean;
  role: "User" | "Admin";
  createdAt: string;
};
