export type LoginRequest = {
  identifier: string;
  password: string;
  fcmToken?: string | null;
};
