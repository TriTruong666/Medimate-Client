---
name: data_handling_ui
description: Guidelines and code templates for handling React Query UI states (loading, error, empty, data) in tables securely and beautifully.
---

# UI Data Handling Pattern for Tables (React Query)

When implementing Tables or Data Grids powered by React Query (e.g., `useQuery`), you must account for 4 primary UI states: **Loading**, **Error**, **Empty Data**, and **Successful Data Display**. 
This pattern is based on `AccountDashboardPage.tsx` and must be strictly followed to ensure a consistent, premium user experience.

## 1. Using UseQuery Destructuring

Always pull the necessary state properties from your custom data hooks:
```tsx
const { data, isLoading, error, isError, refetch } = useYourDataHook();
```

## 2. Table Render Layout Strategy

Control the rendering inside the `<tbody>` using ternary operators. Instead of rendering the whole table conditionally, the table skeleton (Headers) should always remain visible. Only the internal `<tbody>` rows change.

**Important**: For Loading, Error, and Empty states, you MUST use `colSpan={columns.length}` on the `<td>` to span the entire table width, along with a flex container `min-h-100` to ensure vertical alignment.

### ✅ Code Template

```tsx
import { Spinner } from "@/components/custom-ui/Spinner";

function YourTableComponent() {
  const { data, isLoading, error, isError, refetch } = useYourDataHook();
  
  // Assuming `columns` is an array of your table headers
  const colCount = columns.length; 

  return (
    <table className="dark:border-border-dark w-full min-w-225 table-fixed border-collapse border-x border-t border-gray-100 text-left">
      <thead>
        {/* Render your Table Headers here */}
      </thead>
      
      <tbody className="dark:divide-border-dark divide-y divide-gray-100">
        {isLoading ? (
          // 1. LOADING STATE
          <tr>
            <td colSpan={colCount}>
              <div className="flex min-h-100 w-full flex-col items-center justify-center py-10">
                <Spinner size="lg" />
                <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Đang tải dữ liệu...
                </p>
              </div>
            </td>
          </tr>
        ) : isError ? (
          // 2. ERROR STATE
          <tr>
            <td colSpan={colCount}>
              <div className="flex min-h-100 w-full flex-col items-center justify-center py-10">
                <h3 className="mt-4 text-lg text-white">Đã xảy ra lỗi</h3>
                <p className="mt-1 max-w-75 text-center text-sm text-gray-400">
                  {error?.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."}
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-6 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Thử lại
                </button>
              </div>
            </td>
          </tr>
        ) : data && data.length > 0 ? (
          // 3. HAPPY CASE (DATA RENDER)
          data.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5">
              {/* Process your Table Cells <td>...</td> here */}
            </tr>
          ))
        ) : (
          // 4. EMPTY DATA STATE
          <tr>
            <td colSpan={colCount}>
              <div className="flex min-h-100 w-full flex-col items-center justify-center py-10">
                <h3 className="mt-4 text-lg text-white">Danh sách trống</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Không tìm thấy dữ liệu nào trong hệ thống.
                </p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
```

## Rules for Component Usage

1. **`Spinner` component**: Use `<Spinner size="lg" />` imported from `@/components/custom-ui/Spinner` for data table loadings.
2. **`min-h-100`**: To prevent layout shifting, full-table state blocks must use `min-h-100` flex containers.
3. **Refetching**: Always provide a "Thử lại" manual retry button in the Error state bound to `refetch()`.
4. **Header Visibility**: Keep table headers visually present during the Loading/Empty/Error states so the user maintains context. Do NOT unmount the `<thead>`.
