---
name: dashboard_table_card_pattern
description: Guidelines and code templates for creating dashboard pages with toggleable Table and Card layouts in Medimate.
---

# Dashboard Table and Card Layout Pattern

When creating a new dashboard page that lists data (e.g., resources, documents, users), it is highly encouraged to provide both a **Table Layout** and a **Grid/Card Layout**. Please follow this specific pattern based on `DocumentDashboardPage.tsx` to maintain UI consistency across the Medimate admin dashboard.

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

## 4. Table Component Styling

Tables must use the predefined dark/light theme classes strictly. Avoid creating custom padding randomly. Use the layout seen below:

```tsx
function YourTableComponent({ data }: { data: any[] }) {
  return (
    <table className="dark:border-border-dark w-full min-w-225 table-fixed border-collapse border-x border-t border-gray-100 text-left">
      <thead>
        <tr className="dark:bg-border-dark/30 bg-gray-50/50">
          <th className="border-b p-4 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400 dark:border-border-dark border-r border-gray-100">
            Column 1
          </th>
          {/* ... other th ... */}
        </tr>
      </thead>
      <tbody className="dark:divide-border-dark divide-y divide-gray-100">
        {data.map((row, i) => (
          <tr
            key={i}
            className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
          >
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              Row Content
            </td>
            {/* ... other td ... */}
          </tr>
        ))}
      </tbody>
    </table>
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
