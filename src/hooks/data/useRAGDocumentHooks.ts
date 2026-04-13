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
 * Hook lấy danh sách tài liệu chưa được gán vào bất kỳ collection nào
 */
export function useRAGUncollectedDocuments(params: {
  page: number;
  limit: number;
  q?: string;
}) {
  return useQuery({
    queryKey: ["rag", "documents", "uncollected", params],
    queryFn: async () => {
      const res = await RAGDocumentService.getUncollectedDocuments(params);
      if (!res.success) {
        throw new Error(
          res.message || "Không thể lấy danh sách tài liệu chưa thu nạp",
        );
      }
      return res; // Trả về RAGApiPaginatedResponse<RAGDocument>
    },
  });
}

/**
 * Hook lấy danh sách tài liệu đang chờ xử lý (pending)
 */
export function useRAGPendingDocuments(params: {
  page: number;
  limit: number;
  q?: string;
}) {
  return useQuery({
    queryKey: ["rag", "documents", "pending", params],
    queryFn: async () => {
      const res = await RAGDocumentService.getPendingDocuments(params);
      if (!res.success) {
        throw new Error(
          res.message || "Không thể lấy danh sách tài liệu đang chờ xử lý",
        );
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

/**
 * Hook lấy danh sách tài liệu chưa được gán (Infinite Scroll)
 */
export function useRAGUncollectedDocumentsInfinite(params: {
  limit: number;
  q?: string;
}) {
  return useInfiniteQuery({
    queryKey: ["rag", "documents", "uncollected", "infinite", params],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await RAGDocumentService.getUncollectedDocuments({
        page: pageParam as number,
        limit: params.limit,
        q: params.q,
      });
      if (!res.success) {
        throw new Error(
          res.message || "Không thể lấy danh sách tài liệu chưa thu nạp",
        );
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

/**
 * Hook lấy danh sách tài liệu đang chờ xử lý (Infinite Scroll)
 */
export function useRAGPendingDocumentsInfinite(params: {
  limit: number;
  q?: string;
  collection_id?: string;
}) {
  return useInfiniteQuery({
    queryKey: ["rag", "documents", "pending", "infinite", params],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await RAGDocumentService.getPendingDocuments({
        page: pageParam as number,
        limit: params.limit,
        q: params.q,
        collection_id: params.collection_id,
      });
      if (!res.success) {
        throw new Error(
          res.message || "Không thể lấy danh sách tài liệu đang chờ xử lý",
        );
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

/**
 * Hook xóa tài liệu vĩnh viễn
 */
export function useDeleteRAGDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => RAGDocumentService.deleteDocument(documentId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Thành công", "Đã xóa tài liệu vĩnh viễn");
        queryClient.invalidateQueries({ queryKey: ["rag", "documents"] });
      } else {
        toast.error("Thất bại", res.message || "Xóa tài liệu thất bại");
      }
    },
    onError: (err) => {
      toast.error("Lỗi", getApiErrorMessage(err));
    },
  });
}
