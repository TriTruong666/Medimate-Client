export type User = {
    userId: string;
    phoneNumber: string;
    fullName: string;
    email: string;
    dateOfBirth: string | null;
    gender: "male" | "female" | null;
    avatarUrl: string | null;
    isActive: boolean;
    isOnline: boolean;
    role: "User" | "Admin";
    createdAt: string;
  };