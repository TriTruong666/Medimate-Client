import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "../useToast";
import { getApiErrorMessage } from "@/common/api.error";
import * as RAGDocumentService from "@/apis/rag_document.service";

/**
 * Hook lấy danh sách tài liệu từ RAG server (có phân trang)
 */
export function useRAGDocuments(params: { page: number; limit: number; q?: string }) {
  return useQuery({
    queryKey: ["rag", "documents", params],
    queryFn: async () => {
      const res = await RAGDocumentService.getDocumentList(params);
      if (!res.success) {
        throw new Error(res.message || "Không thể lấy danh sách tài liệu");
      }
      return res; // Trả về RAGApiPaginatedResponse<RAGDocument>
    },
  });
}

/**
 * Hook tải lên nhiều tài liệu cùng lúc
 */
export function useBulkUploadRAGDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filesString: string[]) => RAGDocumentService.bulkUploadDocument(filesString),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Thành công", "Đã tải lên các tài liệu thành công");
        queryClient.invalidateQueries({ queryKey: ["rag", "documents"] });
      } else {
        toast.error("Thất bại", res.message || "Tải lên tài liệu thất bại");
      }
    },
    onError: (err) => {
      toast.error("Lỗi", getApiErrorMessage(err));
    },
  });
}
