import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "../useToast";
import { getApiErrorMessage } from "@/common/api.error";
import * as RAGCollectionService from "@/apis/rag_collection.service";
import type {
  CreateCollectionRequest,
  AssignDocumentToCollectionRequest,
  UpdateCollectionRequest,
  ProcessCollectionRequest,
  RemoveDocumentFromCollectionRequest,
} from "@/types/RAGCollection";

/**
 * Hook lấy danh sách collection từ RAG server (có phân trang)
 */
export function useRAGCollections(params: {
  page: number;
  limit: number;
  q?: string;
}) {
  return useQuery({
    queryKey: ["rag", "collections", params],
    queryFn: async () => {
      const res = await RAGCollectionService.getCollectionList(params);
      if (!res.success) {
        throw new Error(res.message || "Không thể lấy danh sách collection");
      }
      return res; // Trả về RAGApiPaginatedResponse<RAGCollection>
    },
  });
}

/**
 * Hook lấy chi tiết một collection
 */
export function useRAGCollectionDetail(collectionId: string) {
  return useQuery({
    queryKey: ["rag", "collections", collectionId],
    queryFn: async () => {
      const res = await RAGCollectionService.getDetailCollection(collectionId);
      if (!res.success) {
        throw new Error(res.message || "Không thể lấy thông tin collection");
      }
      return res.data;
    },
    enabled: !!collectionId,
  });
}

/**
 * Hook tạo collection mới
 */
export function useCreateRAGCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCollectionRequest) =>
      RAGCollectionService.createCollection(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Thành công", "Đã tạo collection mới");
        queryClient.invalidateQueries({ queryKey: ["rag", "collections"] });
      } else {
        toast.error("Thất bại", res.message || "Tạo collection thất bại");
      }
    },
    onError: (err) => {
      toast.error("Lỗi", getApiErrorMessage(err));
    },
  });
}

/**
 * Hook gán tài liệu vào collection
 */
export function useAssignDocumentsToCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      data,
    }: {
      collectionId: string;
      data: AssignDocumentToCollectionRequest;
    }) => RAGCollectionService.assignDocumentToCollection(collectionId, data),
    onSuccess: (res, variables) => {
      if (res.success) {
        toast.success("Thành công", "Đã gán tài liệu vào collection");
        queryClient.invalidateQueries({
          queryKey: ["rag", "collections", variables.collectionId],
        });
      } else {
        toast.error("Thất bại", res.message || "Gán tài liệu thất bại");
      }
    },
    onError: (err) => {
      toast.error("Lỗi", getApiErrorMessage(err));
    },
  });
}

/**
 * Hook yêu cầu server xử lý (indexing) collection
 */
export function useProcessRAGCollection() {
  return useMutation({
    mutationFn: ({
      collectionId,
      data,
      params,
    }: {
      collectionId: string;
      data: ProcessCollectionRequest;
      params: { client_id: string };
    }) => RAGCollectionService.processCollection(collectionId, data, params),
    onSuccess: (res) => {
      if (res.success) {
        toast.info(
          "Đã bắt đầu xử lý",
          "Server đang xử lý dữ liệu, vui lòng chờ trong giây lát...",
          { duration: 8000 }
        );
      } else {
        toast.error("Thất bại", res.message || "Yêu cầu xử lý thất bại");
      }
    },
    onError: (err) => {
      toast.error("Lỗi", getApiErrorMessage(err));
    },
  });
}

/**
 * Hook cập nhật thông tin collection
 */
export function useUpdateRAGCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      data,
    }: {
      collectionId: string;
      data: UpdateCollectionRequest;
    }) => RAGCollectionService.updateCollection(collectionId, data),
    onSuccess: (res, variables) => {
      if (res.success) {
        toast.success("Thành công", "Đã cập nhật collection");
        queryClient.invalidateQueries({ queryKey: ["rag", "collections"] });
        queryClient.invalidateQueries({
          queryKey: ["rag", "collections", variables.collectionId],
        });
      } else {
        toast.error("Thất bại", res.message || "Cập nhật thất bại");
      }
    },
    onError: (err) => {
      toast.error("Lỗi", getApiErrorMessage(err));
    },
  });
}

/**
 * Hook gỡ tài liệu khỏi collection
 */
export function useRemoveDocumentsFromCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      data,
    }: {
      collectionId: string;
      data: RemoveDocumentFromCollectionRequest;
    }) => RAGCollectionService.removeDocumentFromCollection(collectionId, data),
    onSuccess: (res, variables) => {
      if (res.success) {
        toast.success("Thành công", "Đã gỡ tài liệu khỏi collection");
        queryClient.invalidateQueries({
          queryKey: ["rag", "collections", variables.collectionId],
        });
      } else {
        toast.error("Thất bại", res.message || "Gỡ tài liệu thất bại");
      }
    },
    onError: (err) => {
      toast.error("Lỗi", getApiErrorMessage(err));
    },
  });
}
