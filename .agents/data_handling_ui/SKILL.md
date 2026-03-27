---
name: data_handling_ui
description: Guidelines and code templates for handling React Query UI states (loading, error, empty, data) in tables and grid layouts securely and beautifully.
---

# UI Data Handling Pattern (React Query)

When implementing data-driven UIs (Tables, Grids, or Details) powered by React Query, you must account for 4 primary UI states: **Loading**, **Error**, **Empty Data**, and **Successful Data Display**.

This pattern ensures a premium user experience and consistent behavior across the Picare OMS dashboard.

## 1. Using UseQuery Destructuring

Always pull the necessary state properties from your custom data hooks:
```tsx
const { data, isLoading, error, isError, refetch } = useYourDataHook();
```

---

## 2. Table Layout Strategy

For tables, maintain the table structure (`<table>`, `<thead>`) but conditionalize the `<tbody>` rows.

### ✅ Table Template
```tsx
import { Spinner } from "@/components/custom-ui/Spinner";

function YourTableComponent() {
  const { data, isLoading, error, isError, refetch } = useYourDataHook();
  const colCount = 5; // Total columns in your table

  return (
    <table>
      <thead>{/* Headers */}</thead>
      <tbody>
        {isLoading ? (
          /* 1. LOADING STATE */
          <tr>
            <td colSpan={colCount}>
              <div className="flex min-h-100 items-center justify-center"><Spinner size="lg" /></div>
            </td>
          </tr>
        ) : isError ? (
          /* 2. ERROR STATE */
          <tr>
            <td colSpan={colCount}>
              <div className="flex min-h-100 flex-col items-center justify-center">
                <h3>Đã xảy ra lỗi</h3>
                <button onClick={() => refetch()}>Thử lại</button>
              </div>
            </td>
          </tr>
        ) : data && data.length > 0 ? (
          /* 3. HAPPY CASE */
          data.map(item => <tr key={item.id}>{/* Cells */}</tr>)
        ) : (
          /* 4. EMPTY STATE */
          <tr>
            <td colSpan={colCount}>
              <div className="flex min-h-100 items-center justify-center">Danh sách trống</div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
```

---

## 3. Grid/Card Layout Strategy (Premium Dashboard Pattern)

For dashboard grids (e.g., Company list), use **Skeleton Cards** (pulse effects) for loading and **Minimalist Hero Blocks** (no background/border) for error/empty states. This keeps the interface clean and premium.

### ✅ Grid Template (Skeleton + Minimalist States)
```tsx
import { HiOutlineRefresh, HiOutlineArchive } from "react-icons/hi";

export function YourGridDashboard() {
  const { data, isLoading, isError, error, refetch } = useYourDataHook();

  return (
    <div>
      {isLoading ? (
        /* 1. PREMIUM LOADING (SKELETONS) */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-primary h-32 animate-pulse bg-white/5 opacity-50" />
          ))}
        </div>
      ) : isError ? (
        /* 2. MINIMALIST ERROR BLOCK (No Card BG) */
        <div className="flex min-h-60 flex-col items-center justify-center p-8 text-center">
           <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <HiOutlineRefresh className="text-3xl text-red-500/50" />
            </div>
          <h3 className="text-white text-lg font-semibold">Đã xảy ra lỗi</h3>
          <p className="text-white/50 text-sm mt-2">{error?.message || "Không thể tải dữ liệu"}</p>
          <button onClick={() => refetch()} className="mt-6 flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20">
            <HiOutlineRefresh /> Thử lại
          </button>
        </div>
      ) : data && data.length > 0 ? (
        /* 3. DATA RENDER */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map(item => <YourCard key={item.id} data={item} />)}
          <AddCard />
        </div>
      ) : (
        /* 4. MINIMALIST EMPTY STATE (No Card BG) */
        <div className="flex min-h-60 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <HiOutlineArchive className="text-3xl text-white/20" />
          </div>
          <h3 className="text-white text-lg font-semibold">Danh sách trống</h3>
          <p className="text-white/50 text-sm mt-2">Chưa có dữ liệu nào trong hệ thống</p>
          <button onClick={onAdd} className="btn-primary mt-6">Thêm ngay</button>
        </div>
      )}
    </div>
  );
}
```

---

## 📏 Rules for Data Handling

1. **Minimalist Style**: Avoid using boxed cards or background panels for Empty/Error states unless specifically requested. A centered icon + text on a transparent background is preferred for Picare OMS.
2. **Skeleton Pulse**: For Grid/Card layouts, use `animate-pulse` cards that respect the same grid structure as the final content.
3. **Context Preservation**: Page titles and navigation elements must remain interactive/visible while data is loading.
4. **Error Icons**: Use relevant icons (e.g., Refresh for errors, Archive/Box for empty) with subtle tinted backgrounds (e.g., `bg-red-500/10`).
5. **Layout Stability**: Maintain a consistent `min-h` for state containers to prevent layout jumping when switching states.


