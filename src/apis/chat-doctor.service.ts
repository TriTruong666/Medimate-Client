import type { BaseResponse } from "@/types/APIResponse";
import type {
  ChatDoctorMessageResponse,
  ChatSessionSummaryResponse,
  SendChatDoctorMessageBody,
} from "@/types/ChatDoctor";
import { axiosNETClient } from "./client";

function toResponseArray<T>(payload: BaseResponse<T[] | null>): BaseResponse<T[]> {
  return {
    ...payload,
    data: payload.data || [],
  };
}

export async function getDoctorChatSessions(
  doctorId: string,
): Promise<BaseResponse<ChatSessionSummaryResponse[]>> {
  const res = await axiosNETClient.get(`/api/v1/chatdoctor/doctors/${doctorId}/sessions`);
  return toResponseArray(res.data as BaseResponse<ChatSessionSummaryResponse[] | null>);
}

export async function getFamilyChatSessions(
  familyId: string,
): Promise<BaseResponse<ChatSessionSummaryResponse[]>> {
  const res = await axiosNETClient.get(`/api/v1/chatdoctor/families/${familyId}/sessions`);
  return toResponseArray(res.data as BaseResponse<ChatSessionSummaryResponse[] | null>);
}

export async function getChatSessionDetails(
  sessionId: string,
  isDoctorRequest = false,
): Promise<BaseResponse<ChatSessionSummaryResponse>> {
  const res = await axiosNETClient.get(
    `/api/v1/chatdoctor/sessions/${sessionId}/details`,
    {
      params: { isDoctorRequest },
    },
  );
  return res.data;
}

export async function getChatSessionMessages(
  sessionId: string,
): Promise<BaseResponse<ChatDoctorMessageResponse[]>> {
  const res = await axiosNETClient.get(`/api/v1/chatdoctor/sessions/${sessionId}/messages`);
  return toResponseArray(res.data as BaseResponse<ChatDoctorMessageResponse[] | null>);
}

export async function sendChatSessionMessage(
  sessionId: string,
  request: SendChatDoctorMessageBody,
): Promise<BaseResponse<ChatDoctorMessageResponse>> {
  const formData = new FormData();
  formData.append("content", request.content || "");

  if (request.attachmentFile) {
    formData.append("attachmentFile", request.attachmentFile);
  }

  const res = await axiosNETClient.post(
    `/api/v1/chatdoctor/sessions/${sessionId}/messages`,
    formData,
  );

  return res.data;
}

export async function markChatSessionMessagesRead(
  sessionId: string,
): Promise<BaseResponse<boolean>> {
  const res = await axiosNETClient.put(
    `/api/v1/chatdoctor/sessions/${sessionId}/messages/read`,
  );
  return res.data;
}