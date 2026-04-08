import { useQuery, useMutation } from "@tanstack/react-query";
import * as SessionService from "@/apis/session.service";
import { toast } from "../useToast";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";

export function useMyConsultationSessions(enabled = true) {
  return useQuery({
    queryKey: ["my-consultation-sessions"],
    queryFn: async () => {
      const res = await SessionService.getMyConsultationSessions();
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch sessions");
      }
      return res.data || [];
    },
    enabled,
    retry: false,
  });
}

export function useAppointmentSession(appointmentId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["appointment-session", appointmentId],
    queryFn: async () => {
      const res = await SessionService.getSessionByAppointment(appointmentId);
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch session");
      }
      return res.data;
    },
    enabled,
    retry: false,
  });
}

export function useGetVideoCallToken() {
  return useMutation({
    mutationFn: (sessionId: string) =>
      SessionService.getVideoCallToken(sessionId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Kết nối thành công", "Đã lấy Token Video Call.");
        console.log("Token Data:", data.data);
      } else {
        toast.error(
          "Không lấy được Token",
          translateErrorMessage(data.error?.code, data.message),
        );
      }
    },
    onError: (error: unknown) => {
      toast.error("Lỗi Video Call", getApiErrorMessage(error));
    },
  });
}

export function useJoinConsultationSession() {
  return useMutation({
    mutationFn: (sessionId: string) =>
      SessionService.joinConsultationSession(sessionId),
    onError: (error: unknown) => {
      console.error("Lỗi khi tham gia vào phiên:", getApiErrorMessage(error));
    },
  });
}

export function useEndConsultationSession() {
  return useMutation({
    mutationFn: (sessionId: string) =>
      SessionService.endConsultationSession(sessionId),
    onError: (error: unknown) => {
      toast.error("Chấm dứt cuộc gọi thất bại", getApiErrorMessage(error));
    },
  });
}
