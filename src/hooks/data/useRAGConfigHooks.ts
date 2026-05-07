import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import * as RAGConfigService from "@/apis/rag_config.service";
import { toast } from "../useToast";
import { getApiErrorMessage } from "@/common/api.error";
import type { RAGConfigUpdate } from "@/types/RAGConfig";

/**
 * Hook lấy cấu hình RAG hiện tại của hệ thống
 */
export function useRAGConfig() {
  return useQuery({
    queryKey: ["rag", "config", "current"],
    queryFn: async () => {
      const res = await RAGConfigService.getCurrentRAGConfig();
      if (!res.success) {
        throw new Error(res.message || "Không thể lấy cấu hình RAG");
      }
      return res.data;
    },
  });
}

/**
 * Hook cập nhật cấu hình RAG cho hệ thống
 */
export function useUpdateRAGConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RAGConfigUpdate) => RAGConfigService.updateRAGConfig(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Thành công", "Đã cập nhật cấu hình hệ thống");
        queryClient.invalidateQueries({ queryKey: ["rag", "config", "current"] });
      } else {
        toast.error("Thất bại", res.message);
      }
    },
    onError: (err) => toast.error("Lỗi", getApiErrorMessage(err)),
  });
}
