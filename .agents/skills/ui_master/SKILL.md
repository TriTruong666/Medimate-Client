---
name: medimate_ui_master
description: "The consolidated master guide for building high-end, minimalist dark theme interfaces in the Medimate dashboard. Includes page registration, dashboard layouts, component usage from src/components, and specialized designs. Use Vietnamese to communicate."
---

# Medimate UI Master Documentation

This document is the single source of truth for the **UI/UX** of the Medimate ecosystem. It consolidates all design principles, layout patterns, and specialized UI components.

> [!IMPORTANT]
> **Component Reusability**: Always maximize the use of existing components in `src/components`. Never reinvent basic UI elements like `Spinner`, `Badge`, `IconAction`, `Tooltip`, `Breadcrumb`, `Pagination`, or `GlassSelect`.

---

## 🌑 1. Core Aesthetic & Design Standards

Maintain a "Simple & Black" aesthetic. Our goal is a premium, high-end dark SaaS feel.

### 🎨 Design Palette & Tokens
- **Backgrounds**: Main (`#EC4899`), Surface (`#202022`), Glass (`bg-white/5` or `bg-white/2` with `backdrop-blur`).
- **Borders**: Thin and subtle (`border-white/10` or `border-white/5`).
- **Primary Color**: `#de3c3c` (Red) for primary actions.
- **Accent Purple**: `#E1A3F1` for branding and decorative elements.
- **Typography**: Display/Headings (`OverusedGrotesk`), Body (`Manrope`).
- **Text**: White for headings, `text-gray-400` or `white/40` for secondary/helper text. Avoid pure bright white for large blocks of text.

### 📐 Principles of Minimalism
- **No Decorative Clutter**: Do NOT add icons next to every label. Only use icons for primary navigation or critical buttons.
- **Badge Usage**: Avoid colorful status badges everywhere. Use subtle text colors or dot indicators where possible.
- **Tabular Numerals**: Always use `tabular-nums` for any numbers to prevent layout jitter during data updates.
- **Micro-interactions**: Use `hover:scale-[1.02]` or `transition-all` instead of heavy shadows or glows.

---

## 🚦 2. Page Structure & Registration

Follow these steps strictly when adding a new page to ensure consistent routing, breadcrumbs, and layout.

### A. Define the Path Constants
All paths MUST be centralized in `src/config/paths.ts` under the `DASHBOARD` object (e.g., `MY_NEW_PAGE: "/dashboard/my-page"`).

### B. Page Layout Template (`src/pages/*.tsx`)
Every page should follow this structural hierarchy. Use `@/components/custom-ui/Breadcrumb` for navigation.

```tsx
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { motion } from "framer-motion";

export default function PageLayoutTemplate() {
  return (
    <div className="page-layout">
      {/* 1. Header with Breadcrumb */}
      <div className="mb-6 flex flex-col">
        <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Current" }]} />
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Tiêu đề trang
        </h1>
      </div>

      {/* 2. Main Content Container (Animated) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
      >
        {/* Components go here */}
      </motion.div>
    </div>
  );
}
```

### C. Register Lazy Import & ROUTES_CONFIG
In `src/config/routes.config.tsx`:
1. Use `lazy(() => import("@/pages/..."))` for code splitting.
2. Add a route object to `ROUTES_CONFIG` matching the constant from `PATHS.DASHBOARD.X`.

---

## 📊 3. Dashboard Data Handling Patterns (React Query)

When implementing data-driven UIs (Tables, Grids) powered by React Query, you must rigorously account for 4 UI states: **Loading**, **Error**, **Empty Data**, and **Successful Data Display**.

### A. Table vs. Card Toggle
For list-heavy pages, provide a switcher in the header between Table (`LuTable2`) and Card (`LuGrid3X3`) views. Manage it via `const [tableLayout, setTableLayout] = useState<"table" | "card">("table");`.

### B. Table Component Layout
Tables must follow a consistent layout for a clean "Simple & Black" look.
- **Container**: Wrap in `div.overflow-x-auto`.
- **Table**: `dark:border-border-dark w-full min-w-225 table-fixed border-collapse border-x border-t border-gray-100 text-left`.
- **Header**: `dark:bg-border-dark/30 bg-gray-50/50` with uppercase, small text for `<th>`.
- **Loading State**: Render `<tr><td colSpan={N}><Spinner size="lg" />...</td></tr>` inside `<tbody>`.
- **Pagination**: Every table MUST be accompanied by the `@/components/custom-ui/Pagination` component. The pagination must be **connected** directly to the bottom of the table (no top margin) to shared the border system, creating a unified data block.

### C. Grid/Card Layout Strategy (Skeletons & Minimalist Blocks)
For dashboard grids, use **Skeleton Cards** (pulse effects) for loading and **Minimalist Blocks** (transparent/no background) for error/empty states.

```tsx
{isLoading ? (
  /* PREMIUM LOADING (SKELETONS) */
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-48 rounded-2xl animate-pulse bg-white/5 opacity-50" />
    ))}
  </div>
) : isError ? (
  /* NEW ERROR STATE PATTERN */
  <div className="flex min-h-[400px] flex-col items-center justify-center py-10">
    <p className="max-w-md text-center text-sm font-medium text-red-400">
      Đã xảy ra lỗi khi tải dữ liệu từ hệ thống
    </p>
    <button
      onClick={() => refetch()}
      className="mt-6 rounded-lg border border-white/5 bg-white/5 px-6 py-2.5 text-xs font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
    >
      Thử lại
    </button>
  </div>
) : data && data.length > 0 ? (
  /* DATA RENDER */
  <div className="grid...">...</div>
) : (
  /* NEW EMPTY STATE PATTERN (WITH CTA, NO ICON) */
  <div className="flex min-h-[400px] flex-col items-center justify-center py-10 text-center">
    <h3 className="text-lg font-semibold text-white">
      Danh sách trống
    </h3>
    <p className="mt-2 text-sm text-white/50">
      Chưa có dữ liệu nào được tìm thấy trong hệ thống
    </p>
    <button
      onClick={handleAction}
      className="mt-6 flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2.5 text-xs font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-red-600"
    >
      <FiPlus className="text-lg" />
      Thêm ngay
    </button>
  </div>
)}
```

---

## 🧩 4. Specialized Component Patterns

### A. Modals (High-End Dark)
Modals are managed via `src/stores/modalStore.ts` using Jotai.
- **Container**: `flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl`. Standard width is often `w-150` for forms.
- **Header**:
  - **Styles**: `flex items-center justify-between border-b border-white/10 bg-white/5 p-6`.
  - **Title**: `text-base font-semibold tracking-tight text-white`.
  - **Close Button**: `rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white`. Use `HiOutlineX` (h-5 w-5).
- **Footer**: 
  - **Styles**: `flex items-center justify-end gap-3 border-t border-white/10 bg-white/2 p-6 backdrop-blur-md`.
  - **Secondary Button (Exit/Cancel)**: `rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10`.
  - **Primary Button (Next/Submit)**: `bg-primary rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:bg-white/10 disabled:text-white/40`.
- **Animations**: Modals automatically fade and scale via `AnimatePresence` in `ModalContainer.tsx`.
- **Patterns**:
  - **Multi-step Selection (Phase Pattern)**: Use a `step` or `phase` state. Start with a selection screen using large cards.
    - **Selection Card Style**: `rounded-xl border p-6 transition-all duration-300`.
    - **Active State**: `border-primary bg-primary/10 shadow-lg shadow-primary/20`.
    - **Hover State**: `border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10`.
    - **Footer Logic**: In Step 1, the primary button is "Tiếp theo" (Next) and is `disabled` until a selection is made. In Step 2, show a "Quay lại" (Back) button on the left to return to the selection phase.
  - **Confirm/Sync Modal**: Highlight warnings with `border-yellow-500/20 bg-yellow-500/5`. Use `isModalLockedAtom` to prevent closing during async tasks.

### B. Analytics & Charts
- **Dependencies**: `react-chartjs-2` + `framer-motion`.
- **Colors**: Use exact Hex values (Green `#22c55e`, Orange `#f97316`, Pink `#EC4899`, Purple `#8b5cf6`).
- **Charts**: Hide grids (`display: false`). Use `cutout: "70%"` for Doughnut charts and center the absolute label.
- **Metric Card**: Keep them simple (`rounded-lg border border-white/10 bg-white/5`) with `tabular-nums` for the main value.

### C. Terminal / Command Console
Used for background tasks (e.g. Syncing).
- **Aesthetic**: `bg-black/60 shadow-2xl backdrop-blur-sm`.
- **Header**: Faux window controls (red, yellow, green circles) + task name.
- **Body**: `font-mono text-[11px]`. Prepend `>` to lines. Slice logs array so it doesn't overflow infinitely. Add `text-primary inline-block animate-pulse` for the `_` cursor.

### D. Item Card Pattern
A structured layout for grid lists.
- **Layout**: `flex flex-col rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur`. Interaction via `whileHover={{ y: -4 }}`.
- **Separator**: Use `h-px bg-white/5` between sections.
- **Footer**: A flex row containing a **Status Indicator** (left) and **Action Icons** (right) using `Tooltip` + `IconAction`. Hide actions until `group-hover:opacity-100`.

---

## ⚖️ 5. Golden Rules for Styling

1. **Leverage `src/components`**: Always check `src/components` for pre-built UI components (`Input`, `Select`, `Tooltip`, `Badge`, `IconAction`, `Spinner`, etc.) before deciding to build custom elements.
2. **Never use generic blue/green**: Always use the project's Red/Purple/Zinc dark system.
3. **Subtle Transitions**: Use `transition-all duration-300` for all hover states.
4. **Spacing**: Maintain generous white space (airy design) to avoid an "overcrowded" feel.
5. **Rounded Corners**: Stick to `rounded-lg` for inputs/buttons and `rounded-2xl` for large containers.
