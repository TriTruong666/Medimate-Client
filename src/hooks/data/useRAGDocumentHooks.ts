import {
  useMutation,
  useQueryClient,
  useQuery,
  useInfiniteQuery,
} from "@tanstack/react-query";
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
    mutationFn: (formData: FormData) => RAGDocumentService.bulkUploadDocument(formData),
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

/**
 * Hook lấy danh sách tài liệu theo kiểu Infinite Scroll
 */
export function useRAGDocumentsInfinite(params: { limit: number; q?: string }) {
  return useInfiniteQuery({
    queryKey: ["rag", "documents", "infinite", params],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await RAGDocumentService.getDocumentList({
        page: pageParam as number,
        limit: params.limit,
        q: params.q,
      });
      if (!res.success) {
        throw new Error(res.message || "Không thể lấy danh sách tài liệu");
      }
      return res; // Trả về RAGApiPaginatedResponse<RAGDocument>
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.data.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
  });
}
