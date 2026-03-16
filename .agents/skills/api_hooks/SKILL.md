---
name: api_hooks
description: "Guidelines and templates for writing API hooks (React Query) in the Medimate dashboard."
---

# Medimate API Hooks Standard

This skill defines the standard pattern for writing API integration hooks in the Medimate project. All API calls must be wrapped in custom React hooks using `@tanstack/react-query` to ensure consistent data fetching, caching, error handling, and UI feedback (toast notifications).

## 📁 File Structure & Location
- API service files (Axios calls) are placed in `src/apis/*.service.ts`.
- Hooks mapping to these services are placed in `src/hooks/data/use*Hooks.ts`.

## 📦 Required Imports

When creating a new hook file, ensure you include the following standard imports:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../useFetch"; // Use this instead of standard useQuery
import { toast } from "../useToast"; // Standard toast notification
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error"; // Error handling
// Import your service here:
// import * as YourService from "@/apis/your.service";
```

## 🔍 1. Queries (Fetching Data)

For data fetching, use the custom `useFetch` wrapper. It automatically handles extracting `data` from our standard `BaseResponse<T>` and throwing errors when `success` is false.

### Template:
```typescript
export function useYourEntityList() {
  return useFetch(["your_query_key"], async () => YourService.getEntities());
}

// Or with parameters:
export function useYourEntityDetail(id: string) {
  return useFetch(["your_query_key", id], async () => YourService.getEntityDetail(id), {
    enabled: !!id, // Prevent fetching if id is missing
  });
}
```

## ✍️ 2. Mutations (Creating, Updating, Deleting)

For operations that modify data, we use `useMutation`.
**Crucial Rules for Mutations:**
1. Check `data.success` inside `onSuccess`.
2. Use `toast.success` and `toast.error` for both successful cases and handled logical errors.
3. Call `queryClient.invalidateQueries` to refresh the associated data table upon success.
4. Extract server-side logical errors using `translateErrorMessage(data.error?.code, data.message)`.
5. Extract network/system errors in `onError` using `getApiErrorMessage(error)`.

### Template:
```typescript
export function useCreateYourEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: YourService.createEntity,

    onSuccess: (data) => {
      // 1. Success case
      if (data.success) {
        toast.success("Thành công", "Đã thêm dữ liệu mới.");
        // Invalidate the query key used in useFetch
        queryClient.invalidateQueries({ queryKey: ["your_query_key"] });
      } 
      // 2. Logical Error from API (e.g. duplicate email, validation)
      else {
        toast.error(
          "Thất bại",
          translateErrorMessage(data.error?.code, data.message)
        );
      }
    },

    // 3. Network or Unhandled Error
    onError: (error: unknown) => {
      toast.error("Thất bại", getApiErrorMessage(error));
    },
  });
}
```

## 💡 Detailed Example (`useAccountHooks.ts` Reference)

Below is the standard, complete reference for an optimal hook setup based on `useAccountHooks.ts`:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../useFetch";
import * as UserService from "@/apis/user.service";
import { toast } from "../useToast";
import {
  getApiErrorMessage,
  translateErrorMessage,
} from "@/common/api.error";

// --- QUERY ---
export function useUserList() {
  return useFetch(["users"], async () => UserService.getUsers());
}

// --- MUTATION ---
export function useCreateDoctor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: UserService.createDoctor,

    onSuccess: (data) => {
      if (data.success) {
        toast.success("Tạo tài khoản thành công", "Đã thêm bác sĩ mới.");
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error(
          "Tạo tài khoản thất bại",
          translateErrorMessage(data.error?.code, data.message),
        );
      }
    },

    onError: (error: unknown) => {
      toast.error("Tạo tài khoản thất bại", getApiErrorMessage(error));
    },
  });
}
```

## ⚖️ Error Handling Flow Explained
- **`translateErrorMessage(code, message)`**: Used inside `onSuccess` when the HTTP request succeeds (200 OK) but the API returns `success: false` due to business logic (e.g., "EMAIL_EXISTS"). It checks the code against our custom API dictionary messages, falling back to the default message provided by the backend.
- **`getApiErrorMessage(error)`**: Used inside `onError` when the HTTP request itself fails (e.g., 400 Bad Request, 500 Server Error) or the network is down.
