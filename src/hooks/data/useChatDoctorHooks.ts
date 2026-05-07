import * as ChatDoctorService from "@/apis/chat-doctor.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import { useDoctorMe } from "@/hooks/data/useDoctorHooks";
import { toast } from "@/hooks/useToast";
import type { SendChatDoctorMessageBody } from "@/types/ChatDoctor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useFetch } from "../useFetch";

type ChatIdentity = {
  doctorId: string;
}

export function useChatIdentity(): ChatIdentity {
  const { data: doctorProfile } = useDoctorMe(true);

  const doctorId = useMemo(() => doctorProfile?.doctorId || "", [doctorProfile?.doctorId]);

  return {
    doctorId,
  };
}

export function useCurrentChatSessions() {
  const { doctorId } = useChatIdentity();

  return useFetch(
    ["chat-sessions", doctorId],
    () => ChatDoctorService.getDoctorChatSessions(doctorId),
    { enabled: !!doctorId },
  );
}

export function useChatSessionDetails(sessionId: string) {
  return useFetch(
    ["chat-session-details", sessionId, true],
    () => ChatDoctorService.getChatSessionDetails(sessionId, true),
    { enabled: !!sessionId },
  );
}

export function useChatSessionMessages(sessionId: string) {
  return useFetch(
    ["chat-messages", sessionId],
    () => ChatDoctorService.getChatSessionMessages(sessionId),
    { enabled: !!sessionId },
  );
}

export function useSendChatSessionMessage(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendChatDoctorMessageBody) =>
      ChatDoctorService.sendChatSessionMessage(sessionId, request),
    onSuccess: (data) => {
      if (data.success) {
        void queryClient.invalidateQueries({ queryKey: ["chat-messages", sessionId] });
        void queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
        void queryClient.invalidateQueries({ queryKey: ["chat-session-details", sessionId] });
        return;
      }

      toast.error(
        "Gửi tin nhắn thất bại",
        translateErrorMessage(data.error?.code, data.message),
      );
    },
    onError: (error) => {
      toast.error("Gửi tin nhắn thất bại", getApiErrorMessage(error));
    },
  });
}

export function useMarkChatSessionMessagesRead(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ChatDoctorService.markChatSessionMessagesRead(sessionId),
    onSuccess: async (data) => {
      if (data.success) {
        void queryClient.invalidateQueries({ queryKey: ["chat-messages", sessionId] });
        void queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
        void queryClient.invalidateQueries({ queryKey: ["chat-session-details", sessionId] });
        await queryClient.refetchQueries({ queryKey: ["chat-sessions"] });
        return;
      }

      toast.error(
        "Đánh dấu đã đọc thất bại",
        translateErrorMessage(data.error?.code, data.message),
      );
    },
    onError: (error) => {
      toast.error("Đánh dấu đã đọc thất bại", getApiErrorMessage(error));
    },
  });
}