import type { BaseResponse } from "@/types/APIResponse";
import { axiosNETClient } from "./client";

export interface SessionData {
  consultanSessionId: string;
  appointmentId: string;
  doctorId: string;
  doctorName?: string | null;
  doctorAvatar?: string | null;
  memberId: string;
  memberName?: string | null;
  memberAvatar?: string | null;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentStatus?: string;
  startedAt?: string | null;
  endedAt?: string | null;
  status: string;
  userJoined: boolean;
  doctorJoined: boolean;
  guardianUserId?: string | null;
  guardianJoined?: boolean;
  note?: string | null;
  doctorNote?: string | null;
}

export interface VideoCallTokenData {
  token: string;
  [key: string]: any;
}

export async function getSessionByAppointment(
  appointmentId: string,
): Promise<BaseResponse<SessionData>> {
  const res = await axiosNETClient.get(
    `/api/v1/sessions/by-appointment/${appointmentId}`,
  );
  return res.data;
}

export async function getMyConsultationSessions(): Promise<
  BaseResponse<SessionData[]>
> {
  const res = await axiosNETClient.get(`/api/v1/sessions/me`);
  return res.data;
}

export async function getVideoCallToken(
  sessionId: string,
): Promise<BaseResponse<VideoCallTokenData>> {
  const res = await axiosNETClient.get(`/api/v1/video-call/token/${sessionId}?role=publisher`);
  return res.data;
}

export async function joinConsultationSession(
  sessionId: string,
): Promise<BaseResponse<any>> {
  const res = await axiosNETClient.post(`/api/v1/sessions/${sessionId}/join`, {
    role: "doctor",
  });
  return res.data;
}

export async function endConsultationSession(
  sessionId: string,
): Promise<BaseResponse<any>> {
  const res = await axiosNETClient.post(`/api/v1/sessions/${sessionId}/end`, {});
  return res.data;
}

export async function requestEndConsultationSession(
  sessionId: string,
): Promise<BaseResponse<any>> {
  const res = await axiosNETClient.post(`/api/v1/sessions/${sessionId}/request-end`, {});
  return res.data;
}

export async function retryRecordingSession(
  sessionId: string,
): Promise<BaseResponse<any>> {
  const res = await axiosNETClient.post(`/api/v1/sessions/${sessionId}/retry-recording`, {});
  return res.data;
}
