---
name: rag_api_hooks
description: "Các template chuẩn cho React Query hooks khi làm việc với RAG server. Sử dụng RAGApiResponse và RAGApiPaginatedResponse. Viết bằng tiếng Việt."
---

# RAG API Hooks Standard

Quy chuẩn viết hooks cho RAG Server. Mọi API call đến RAG server phải sử dụng các RAG types để đảm bảo tính nhất quán của dữ liệu và phân trang.

## 📦 Import Chuẩn

```typescript
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "../useToast"; 
import { getApiErrorMessage } from "@/common/api.error";
import type { RAGApiResponse, RAGApiPaginatedResponse } from "@/types/APIResponse";
// import * as RAGService from "@/apis/rag/your.service";
```

## 🔍 1. Queries (Data Fetching)

Sử dụng `useQuery` trực tiếp để xử lý chính xác cấu trúc RAG Server.

```typescript
/**
 * Hook lấy danh sách AI Models
 */
export function useRAGModels() {
  return useQuery({
    queryKey: ["rag", "models"],
    queryFn: async () => {
      const res = await RAGService.getAIModels();
      if (!res.success) throw new Error(res.message);
      return res.data; // Trả về T
    }
  });
}

/**
 * Hook lấy danh sách Collections (Có phân trang)
 */
export function useRAGCollections(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ["rag", "collections", params],
    queryFn: async () => {
      const res = await RAGService.getCollections(params);
      if (!res.success) throw new Error(res.message);
      return res; // Trả về RAGApiPaginatedResponse<T>
    }
  });
}
```

## ✍️ 2. Mutations (Cập nhật dữ liệu)

```typescript
/**
 * Hook tạo Collection mới
 */
export function useCreateRAGCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => RAGService.createCollection(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Thành công", "Đã tạo collection mới");
        queryClient.invalidateQueries({ queryKey: ["rag", "collections"] });
      } else {
        toast.error("Thất bại", res.message);
      }
    },
    onError: (err) => toast.error("Lỗi", getApiErrorMessage(err)),
  });
}
```

## ⏹️ 3. Chat & Cancellation (Dừng tiến trình)

```typescript
/**
 * Hook chat với AI
 */
export function useRAGChat() {
  return useMutation({
    mutationFn: (data: RAGChatRequest) => RAGChatService.chatWithAI(data),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error("Thất bại", res.message || "Không thể nhận phản hồi");
      }
    },
    onError: (err) => toast.error("Lỗi", getApiErrorMessage(err)),
  });
}

/**
 * Hook dừng chat đang chạy (cần client_id)
 */
export function useStopRAGChat() {
  return useMutation({
    mutationFn: (clientId: string) => RAGChatService.stopChat(clientId),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error("Thất bại", res.message || "Không thể dừng chat");
      }
    },
    onError: (err) => toast.error("Lỗi", getApiErrorMessage(err)),
  });
}
```

## ⚖️ Điểm khác biệt quan trọng
1. **Phân trang**: `data.pagination` chứa `current_page`, `total_pages`, `limit`, `total_records`.
2. **Success Check**: Luôn kiểm tra `res.success` trong `onSuccess` hoặc `queryFn`.
3. **Data Access**: 
   - Với query thường: `data` là nội dung object/array.
   - Với query phân trang: `data.data.items` là mảng dữ liệu, `data.data.pagination` là thông số trang.
