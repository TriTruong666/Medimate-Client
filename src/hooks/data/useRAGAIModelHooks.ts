import { useQuery } from "@tanstack/react-query";
import * as RAGAIModelService from "@/apis/rag_ai_model.service";

/**
 * Hook lấy danh sách AI models từ RAG server
 * Sử dụng RAGApiResponse<AIModel[]> theo cấu trúc mới của backend
 */
export function useAIModels(params: { skip: number; limit: number }) {
  return useQuery({
    queryKey: ["rag", "ai-models", params],
    queryFn: async () => {
      const res = await RAGAIModelService.getAIModelList(params);
      if (!res.success) {
        throw new Error(res.message || "Không thể lấy danh sách AI models");
      }
      return res.data; // Trả về AIModel[] trực tiếp từ RAGApiResponse
    },
  });
}

/**
 * Hook lấy tất cả AI models (thường dùng cho các dropdown chọn model)
 */
export function useAllAIModels() {
  return useQuery({
    queryKey: ["rag", "ai-models", "all"],
    queryFn: async () => {
      // Vì API hiện tại trả về mảng trực tiếp, chúng ta lấy trang đầu với giới hạn cao
      const res = await RAGAIModelService.getAIModelList({ skip: 0, limit: 100 });
      if (!res.success) {
        throw new Error(res.message || "Không thể lấy danh sách AI models");
      }
      return res.data; // RAGApiResponse.data là mảng AIModel[]
    },
  });
}
