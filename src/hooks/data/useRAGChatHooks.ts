import { useMutation } from "@tanstack/react-query";
import * as RAGChatService from "@/apis/rag_chat.service";
import type { RAGChatRequest } from "@/types/RAGChat";
import { toast } from "../useToast";
import { getApiErrorMessage } from "@/common/api.error";

/**
 * Hook gửi câu hỏi cho AI và nhận câu trả lời
 */
export function useRAGChat() {
  return useMutation({
    mutationFn: (data: RAGChatRequest) => RAGChatService.chatWithAI(data),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error("Thất bại", res.message || "Không thể nhận phản hồi từ AI");
      }
    },
    onError: (err) => {
      toast.error("Lỗi", getApiErrorMessage(err));
    },
  });
}
/**
 * Hook dừng chat đang chạy
 */
export function useStopRAGChat() {
  return useMutation({
    mutationFn: (clientId: string) => RAGChatService.stopChat(clientId),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error("Thất bại", res.message || "Không thể dừng chat");
      }
    },
    onError: (err) => {
      toast.error("Lỗi", getApiErrorMessage(err));
    },
  });
}
