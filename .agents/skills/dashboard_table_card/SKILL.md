---
name: dashboard_table_card_pattern
description: Guidelines and code templates for creating dashboard pages with toggleable Table and Card layouts in Picare.
---

# Dashboard Table and Card Layout Pattern

When creating a new dashboard page that lists data (e.g., resources, documents, users), it is highly encouraged to provide both a **Table Layout** and a **Grid/Card Layout**. Please follow this specific pattern based on `DocumentDashboardPage.tsx` to maintain UI consistency across the Picare admin dashboard.

## 1. State Management

Use a standard React `useState` to keep track of the chosen layout. The default should usually be `"table"`.

```tsx
const [tableLayout, setTableLayout] = useState<"table" | "card">("table");
```

## 2. Layout Toggle Buttons

Place the layout switchers in the action bar (usually grouped with filters and primary actions).
Use icons from `react-icons/lu` (`LuTable2` for table, `LuGrid3X3` for card).

```tsx
import { LuGrid3X3, LuTable2 } from "react-icons/lu";

// ... Inside your header/action bar ...
<div className="flex gap-1 rounded-lg bg-white/5 p-1">
  <button
    onClick={() => setTableLayout("table")}
    className={`${
      tableLayout === "table"
        ? "bg-primary text-white shadow-sm"
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    } flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition`}
  >
    <LuTable2 className="text-sm" />
    Bảng
  </button>
  <button
    onClick={() => setTableLayout("card")}
    className={`${
      tableLayout === "card"
        ? "bg-primary text-white shadow-sm"
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    } flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition`}
  >
    <LuGrid3X3 className="text-sm" />
    Thẻ
  </button>
</div>
```

## 3. Conditional Rendering of the Main Content

Render the corresponding component based on `tableLayout`.

```tsx
{tableLayout === "table" && (
  <div className="my-8">
    <YourTableComponent data={data} />
    <Pagination page={1} pageSize={20} total={data.length} />
  </div>
)}

{tableLayout === "card" && (
  <div className="my-8 space-y-8">
    <YourCardGridComponent data={data} />
    {/* Optional Load More button or Pagination for cards */}
  </div>
)}
```

### 4. Table Component Styling

Tables must follow a consistent layout to ensure a clean, professional "Simple & Black" look, as seen in `AccountDashboardPage.tsx`.

**Core Rules (The REQUIRED Standard):**
- **Container**: Wrap in a `div.overflow-x-auto`.
- **Table Layout**: Use `table-fixed` for precise column width control via `width` classes on `<th>`.
- **Minimum Width**: Set a `min-w-225` utility to prevent squashing.
- **Header Style**: Use `dark:bg-border-dark/30 bg-gray-50/50` with uppercase, small, semi-bold text.
- **Borders**: Use `dark:border-border-dark w-full min-w-225 table-fixed border-collapse border-x border-t border-gray-100 text-left`.
- **Body Styling**: Use `dark:divide-border-dark divide-y divide-gray-100`.
- **Row Hover**: Use `transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5`.

```tsx
function YourTableComponent({ data, isLoading, isError, refetch }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="dark:border-border-dark w-full min-w-225 table-fixed border-collapse border-x border-t border-gray-100 text-left">
        <thead>
          <tr className="dark:bg-border-dark/30 bg-gray-50/50">
            <th className="w-[40%] border-b p-4 text-xs font-semibold uppercase text-gray-500 dark:border-border-dark dark:border-r dark:text-gray-400">
              Cột 1
            </th>
            {/* ... */}
          </tr>
        </thead>
        <tbody className="dark:divide-border-dark divide-y divide-gray-100">
          {isLoading ? (
            <tr>
              <td colSpan={columnCount} className="py-20 text-center">
                <Spinner size="lg" />
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5">
                <td className="dark:border-border-dark border-r border-gray-100 p-4">{/* Content */}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
```

## 5. Card Component Styling (Framer Motion & Glassmorphism)

Cards should use the shared `cardContainer` and `cardItem` motion variants for fluid staggered animations on mount. The grid should be responsive.

```tsx
import { motion } from "framer-motion";
import { cardContainer, cardItem } from "@/motions/cardMotion";

function YourCardGridComponent({ data }: { data: any[] }) {
  return (
    <motion.div
      variants={cardContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {data.map((item) => (
        <YourCardItem key={item.id} data={item} />
      ))}
    </motion.div>
  );
}

function YourCardItem({ data }: { data: any }) {
  return (
    <motion.div
      variants={cardItem}
      whileHover={{ y: -4 }}
      className="group dark:border-border-dark relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white/80 p-4 backdrop-blur transition-colors duration-300 hover:border-white/20 hover:bg-white/10 dark:bg-white/5"
    >
      {/* Header, Meta, and Footer here */}
    </motion.div>
  );
}
```

## 6. Action Icons

Always use the `IconAction` component combined with `Tooltip` for row/card level actions (e.g., Download, Delete, Edit).

```tsx
import { Tooltip } from "@/components/custom-ui/Tooltip";
import IconAction from "@/components/custom-ui/IconAction";
import { HiOutlineDownload, HiOutlineTrash } from "react-icons/hi";

// Example Usage inside a Card Footer or Table Cell
<div className="flex items-center gap-2">
  <Tooltip content="Mô tả hành động">
    <IconAction icon={<HiOutlineDownload />} />
  </Tooltip>
  <Tooltip content="Xoá">
    <IconAction danger icon={<HiOutlineTrash />} />
  </Tooltip>
</div>
```
## 7. Pagination Integration

Pagination must follow the exact UI pattern used in `AccountDashboardPage.tsx` and `HaravanOrderDashboardPage.tsx`.

**Standard Usage:**
1. **Placement**: Place immediately after the table container.
2. **Conditional Rendering**: Hide pagination during `isLoading` or `isError` states to keep the UI clean.
3. **Props**: Pass `total`, `page`, `pageSize`, and an `onPageChange` callback.

```tsx
{/* Inside Dashboard Page */}
<div className="my-8">
  <YourTableComponent data={data} isLoading={isLoading} />
  
  {!isLoading && pagination && (
    <Pagination
      total={pagination.totalRecords}
      page={page}
      pageSize={pagination.pageSize}
      onPageChange={setPage}
    />
  )}
</div>
```

**Design Standards for Pagination:**
- **Alignment**: Items should be aligned using the `Pagination` component's built-in flex layout.
- **Style**: Use the original `Pagination.tsx` UI provided in the project (Glassmorphism borders, subtle hover effects).
- **Behavior**: Must update the parent `page` state via `onPageChange`.
