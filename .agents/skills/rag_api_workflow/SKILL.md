---
name: rag_api_workflow
description: "Hướng dẫn tích hợp API từ RAG Server (AI/Vector DB) vào Medimate Dashboard, sử dụng các types và chuẩn phản hồi riêng biệt. Viết bằng tiếng Việt."
---

# Medimate RAG API Integration Workflow

Tài liệu này định nghĩa quy chuẩn tích hợp dữ liệu từ RAG Server. Khác với server chính, RAG server sử dụng cấu trúc phản hồi và phân trang riêng (snake_case).

---

## 🏗️ Bước 1: Định nghĩa Types (`src/types/*.ts`)
Sử dụng các RAG types đã được định nghĩa trong `src/types/APIResponse.ts`.

- **Dữ liệu đơn lẻ/Danh sách không phân trang**: `RAGApiResponse<T>`
- **Dữ liệu có phân trang**: `RAGApiPaginatedResponse<T>`
- **Metadata phân trang**: `RAGPaginationMetadata`

Ví dụ định nghĩa Model:
```typescript
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  is_active: boolean;
  // ... các field khác từ RAG server
}
```

---

## 🔗 Bước 2: Tạo API Service (`src/apis/rag/*.service.ts`)
Khuyến khích đặt các service liên quan đến RAG trong folder riêng hoặc đặt tên có tiền tố `rag-`.

```typescript
import { axiosClient } from "@/common/axiosClient";
import { RAGApiResponse, RAGApiPaginatedResponse } from "@/types/APIResponse";

export const getAIModels = (): Promise<RAGApiResponse<AIModel[]>> => {
  return axiosClient.get("/rag/models");
};

export const getCollections = (params: { page: number; limit: number }): Promise<RAGApiPaginatedResponse<Collection>> => {
  return axiosClient.get("/rag/collections", { params });
};
```

---

## ⚓ Bước 3: Viết React Query Hooks (`src/hooks/data/rag/*.ts`)
Sử dụng `useQuery` hoặc `useMutation` cùng với `toast` để thông báo trạng thái.

### 1. Fetching (Queries)
Do `useFetch` chuẩn bị ràng buộc với `BaseResponse`, khi dùng cho RAG API bạn có thể dùng `useQuery` trực tiếp hoặc ép kiểu:

```typescript
import { useQuery } from "@tanstack/react-query";

export function useAIModels() {
  return useQuery({
    queryKey: ["rag", "models"],
    queryFn: async () => {
      const res = await RAGService.getAIModels();
      if (!res.success) throw new Error(res.message);
      return res.data; // Trả về AIModel[]
    }
  });
}
```

### 2. Mutations
```typescript
export function useUpdateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => RAGService.updateCollection(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Thành công", "Đã cập nhật collection");
        queryClient.invalidateQueries({ queryKey: ["rag", "collections"] });
      } else {
        toast.error("Thất bại", res.message);
      }
    },
    onError: (err) => toast.error("Lỗi hệ thống", getApiErrorMessage(err))
  });
}
```

---

## ♾️ Bước 4: Xử lý Phân trang "Load More"
RAG Server sử dụng `current_page`, `total_pages`, `limit`, `total_records`.

### Logic xử lý trong Component:
```tsx
const [page, setPage] = useState(1);
const [allData, setAllData] = useState<Collection[]>([]);

const { data: response } = useRAGCollections({ page, limit: 10 });

useEffect(() => {
  if (response?.data.items) {
    if (page === 1) setAllData(response.data.items);
    else setAllData(prev => [...prev, ...response.data.items]);
  }
}, [response, page]);

// Kiểm tra còn trang không:
const hasMore = response?.data.pagination ? 
  response.data.pagination.current_page < response.data.pagination.total_pages : false;
```

---

## 📑 Quy tắc củng cố
- **Tiền tố**: Mọi file service/hook liên quan đến RAG server nên có tiền tố `rag_` hoặc nằm trong folder `rag/`.
- **Error Handling**: Sử dụng trực tiếp `res.message` từ RAG server vì cấu trúc error có thể khác với server chính.
- **Naming**: Tuân thủ snake_case cho các field mapping từ RAG server nhưng chuyển về camelCase cho UI state nếu cần thiết.
