---
name: picare_ui_master
description: "The consolidated master guide for building high-end, minimalist dark theme interfaces in the Picare OMS dashboard. Includes page registration, dashboard layouts, and specialized component designs."
---

# Picare UI Master Documentation

This document is the single source of truth for the **UI/UX** of the Picare OMS ecosystem. It focuses on design principles, layout patterns, and specialized UI components.

---

## 🌑 1. Core Aesthetic & Design Standards

Maintain a "Simple & Black" aesthetic. Our goal is a premium, high-end dark SaaS feel.

### 🎨 Design Palette & Tokens
- **Backgrounds**: Main (`#18181b`), Surface (`#202022`), Glass (`bg-white/5` with `backdrop-blur`).
- **Borders**: Thin and subtle (`border-white/10`).
- **Primary Color**: `#de3c3c` (Red) for primary actions.
- **Accent Purple**: `#E1A3F1` for branding and decorative elements.
- **Typography**: Display/Headings (`OverusedGrotesk`), Body (`Manrope`).

### 📐 Principles of Minimalism
- **No Decorative Clutter**: Do NOT add icons next to every label. Only use icons for primary navigation or critical buttons.
- **Badge Usage**: Avoid colorful status badges. Use subtle text colors or dot indicators.
- **Tabular Numerals**: Always use `tabular-nums` for any numbers to prevent layout jitter during data updates.

---

## 🚦 2. Page Structure & Registration

### Page Layout Template
Every page should follow this structural hierarchy to ensure consistent spacing and animations.

```tsx
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { motion } from "framer-motion";

export default function PageLayoutTemplate() {
  return (
    <div className="page-layout p-6">
      {/* 1. Header with Breadcrumb */}
      <div className="mb-6 flex flex-col">
        <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Current" }]} />
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Page Title
        </h1>
      </div>

      {/* 2. Main Content Container (Animated) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
      >
        {/* Components go here */}
      </motion.div>
    </div>
  );
}
```

---

## 📊 3. Dashboard Layout Patterns

### A. Table vs. Card Toggle
Provide a switcher for list-heavy pages.
- **Icons**: `LuTable2` (Table) and `LuGrid3X3` (Cards).
- **Styling**: Use a pill-shaped container `bg-white/5` for buttons.

### B. Table Visual States
When data is loading or missing, keep the `<thead>` visible and render states inside the `<tbody>`.
- **Loading UI**: Use `<Spinner size="lg" />` centered in a full-width row.
- **Empty UI**: A centered "Danh sách trống" message with a descriptive icon if necessary.
- **Design Rule**: Use `colSpan` to ensure the loading/empty states span the entire row.

---

## 🧩 4. Specialized Component Patterns

### A. Modals (High-End Dark)
- **Container**: `bg-neutral-900/80 backdrop-blur-lg` with `border-white/10`.
- **Header/Footer**: Use a subtle bottom/top border and light background `bg-white/2`.
- **Animations**: Modals should fade and scale into view using `AnimatePresence`.

### B. Analytics & Charts
- **Color Set**: Purple (#8b5cf6), Green (#22c55e), Red-Orange (#f97316), Pink (#EC4899).
- **Chart Styling**: 
    - No grid lines or very faint ones (`rgba(255,255,255,0.05)`).
    - Use `Doughnut` charts with `cutout: "70%"` and centered labels.
- **Stat Box**: Transparent glass container with a hover effect `hover:bg-white/10`.

### C. Terminal / Command Console
Used for background tasks and logs.
- **Aesthetic**: `bg-black/60 shadow-2xl backdrop-blur-sm`.
- **Header**: Faux window controls (red, yellow, green circles).
- **Typography**: Strictly `font-mono text-[11px]`.
- **Micro-interaction**: Use an animated pulse cursor `_`.

---

## ⚖️ Golden Rules for Styling
1. **Never use generic blue/green**: Always use the project's Zinc/Red/Purple system.
2. **Subtle Transitions**: Use `transition-all duration-300` for all hover states.
3. **Glassmorphism**: Combine `bg-white/5` with `backdrop-blur-md` for surfaces.
4. **Spacing**: Maintain generous white space (airy design) to avoid an "overcrowded" feel.
5. **Rounded Corners**: Stick to `rounded-lg` for inputs/buttons and `rounded-2xl` for large containers.
