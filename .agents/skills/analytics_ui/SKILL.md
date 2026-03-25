---
name: analytics_ui
description: "Guidelines and code templates for creating analytics and dashboard pages in Picare, utilizing Chart.js, Framer Motion, and specialized dark theme UI patterns."
---

# Analytics UI Guidelines (Picare)

This skill dictates how to build analytics interfaces, metrics cards, and charts in the PicareOMS ecosystem. The reference implementation is `SummaryDashboardPage.tsx`.

## 📦 Dependencies

- **Charts**: `chart.js` and `react-chartjs-2`
- **Animations**: `framer-motion`
- **Icons**: `react-icons/hi2`, `react-icons/md`, `react-icons/hi`

## 🎨 Design Tokens & Palette

When building charts, avoid generic colors. Use the specific Tailwind-equivalent hex colors matched to the Picare dark theme:
- **Purple**: `#8b5cf6` or `#a855f7` (used for data representing active/in-progress states)
- **Green**: `#22c55e` (used for successful/completed states)
- **Orange**: `#f97316` (used for pending/failed states)
- **Pink (Primary)**: `#EC4899` (used for primary bar metrics)

## 🏗️ Structure and Animation

Analytics pages should always animate in smoothly. Use `framer-motion` along with predefined dashboard variants:

```tsx
import { motion } from "framer-motion";
import { dashboardContainer, dashboardItem } from "@/motions/dashboardMotion";

// Wrapper for a row/grid of cards
<motion.div
  variants={dashboardContainer}
  initial="hidden"
  animate="show"
  className="grid grid-cols-1 gap-6 md:grid-cols-3"
>
  // Individual Card
  <motion.div variants={dashboardItem} className="card-ui-classes">
    ...
  </motion.div>
</motion.div>
```

## 📐 Component Patterns

### 1. The Metric Card (Stat Box)
Use these precise classes for metric boxes:

```tsx
<motion.div variants={dashboardItem} className="rounded-lg border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
  {/* Header */}
  <div className="mb-3 flex items-center justify-between">
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <HiOutlineDocumentText className="text-lg" />
      <span>Total Documents</span>
    </div>
    <span className="text-xs text-emerald-400">+12%</span>
  </div>

  {/* Main Value - ALWAYS use `tabular-nums` for numbers to prevent layout shift */}
  <h3 className="text-3xl font-semibold text-white tabular-nums">
    12,842
  </h3>

  {/* Footer/Subtext */}
  <div className="mt-3 space-y-1 text-xs text-gray-500">
    <p>Last updated <span className="text-gray-400">2 hours ago</span></p>
  </div>
</motion.div>
```

### 2. Chart Layouts & Configuration

Always configure Chart.js to fit cleanly into the dark theme. Hide unnecessary grids and axes. 

**Setup for Chart.js:**
```tsx
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);
```

#### Doughnut Chart Pattern
Used for ratio/percentage representation. Often accompanied by an absolute centered text label.
- **Styling**: `cutout: "70%"`, `borderWidth: 0`
- **Container**: Needs a fixed square container (e.g., `relative h-40 w-40`) to house the absolute text overlay.

```tsx
<div className="relative h-40 w-40">
  <Doughnut data={donutData} options={{ cutout: "70%", plugins: { legend: { display: false } } }} />
  {/* Centered Overlay */}
  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
    <span className="text-2xl font-semibold text-white">85%</span>
    <span className="text-[10px] tracking-wide text-gray-500 uppercase">Success</span>
  </div>
</div>
```

#### Line & Bar Chart Constraints
- Always use `responsive: true, maintainAspectRatio: false`.
- Place inside a container with fixed height (e.g., `h-44` for small charts, `h-64` for full width charts).
- Grid lines should be faint (`rgba(255,255,255,0.05)`) or hidden (`display: false`).
- Text color for ticks should be `#6b7280` or `#9ca3af`.

```tsx
// Grid/Scale Options Example
scales: {
  x: {
    grid: { display: false },
    ticks: { color: "#6b7280", font: { size: 11 } },
  },
  y: {
    grid: { color: "rgba(255,255,255,0.05)" },
    ticks: { color: "#6b7280", font: { size: 11 } },
  },
}
```

### 3. Switchers / Toggles
When allowing users to switch viewpoints (e.g., Line vs Bar, Time ranges), use this glass-like toggle pattern:

```tsx
<div className="flex gap-1 rounded-lg bg-white/5 p-1">
  {/* Active State */}
  <button className="bg-primary flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-sm">
    <MdOutlineShowChart className="text-sm" />
    Line
  </button>
  {/* Inactive State */}
  <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:bg-white/5 hover:text-white">
    <HiOutlineChartBar className="text-sm" />
    Bar
  </button>
</div>
```

## ⚖️ Golden Rules
1. **Never use standard tooltip styles**. If using custom HTML tooltips, match the dark theme, otherwise rely on Chart.js dark default properties via `mode: "index", intersect: false`.
2. **Tabular Numerals**: Every large changing number must have `tabular-nums` attached to its Tailwind classes.
3. **No Heavy Borders**: Keep container borders exact (`border-white/10 bg-white/5`), never solid white or black borders.
