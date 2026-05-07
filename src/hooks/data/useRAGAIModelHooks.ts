import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import * as RAGAIModelService from "@/apis/rag_ai_model.service";
import { toast } from "../useToast";
import { getApiErrorMessage } from "@/common/api.error";
import type { AIModelUpdate } from "@/types/RAGAIModel";

/**
 * Hook lấy danh sách AI models từ RAG server
 */
export function useAIModels(params: { skip: number; limit: number }) {
  return useQuery({
    queryKey: ["rag", "ai-models", params],
    queryFn: async () => {
      const res = await RAGAIModelService.getAIModelList(params);
      if (!res.success) {
        throw new Error(res.message || "Không thể lấy danh sách AI models");
      }
      return res.data;
    },
  });
}

/**
 * Hook lấy tất cả AI models
 */
export function useAllAIModels() {
  return useQuery({
    queryKey: ["rag", "ai-models", "all"],
    queryFn: async () => {
      const res = await RAGAIModelService.getAIModelList({ skip: 0, limit: 100 });
      if (!res.success) {
        throw new Error(res.message || "Không thể lấy danh sách AI models");
      }
      return res.data;
    },
  });
}

/**
 * Hook cập nhật cấu hình cho một AI Model cụ thể
 */
export function useUpdateAIModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ model_id, data }: { model_id: string; data: AIModelUpdate }) =>
      RAGAIModelService.updateAIModel(model_id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Thành công", "Đã cập nhật cấu hình Model");
        queryClient.invalidateQueries({ queryKey: ["rag", "ai-models"] });
      } else {
        toast.error("Thất bại", res.message);
      }
    },
    onError: (err) => toast.error("Lỗi", getApiErrorMessage(err)),
  });
}
