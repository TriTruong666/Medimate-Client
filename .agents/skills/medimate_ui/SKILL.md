---
name: medimate_ui
description: "Guidelines for maintaining Medimate's minimalist, high-end dark theme UI."
---

# Medimate UI Design Standards

This skill ensures all agents maintain a consistent "Simple & Black" aesthetic for the Medimate project. Avoid typical "AI-generated" clutter (excessive badges, redundant icons, bright/flat colors).

## 🌑 Core Aesthetic: "High-End Dark SaaS"

- **Primary Background**: `#18181b` (Zinc-900 equivalent) or `#131315` (Main dark).
- **Surfaces**: Use `#202022` or subtle glass effects (`bg-white/5` with `backdrop-blur`).
- **Borders**: Highly subtle. Use `#27272a` or `white/10`.
- **Text**: White for headings, `text-gray-400` or `white/40` for secondary/helper text. Avoid pure bright white for large blocks of text.

## 📐 Simplicity & Minimalism

> [!IMPORTANT]
> **Constraint**: Do NOT add decorative icons or "status badges" unless strictly necessary for functionality. The UI should feel airy and professional, not "busy."

- **Rounded Corners**: Use `rounded-xl` (0.5rem) or `rounded-2xl` (1rem) for containers.
- **Micro-interactions**: Use `hover:scale-[1.02]` or `transition-all` instead of heavy shadows or glow.
- **Shadows**: Avoid heavy shadows. Use subtle ring or inner borders for depth.

## 🎨 Design Tokens (from index.css)

### Colors
- **Primary**: `#EC4899` (Use sparingly for actions).
- **Accent Purple**: `#E1A3F1` (Used for logo/loader).
- **Background Dark**: `#18181b`.
- **Surface Dark**: `#202022`.

### Typography
- **Main Sans**: `Manrope` (Clean, modern).
- **Headings/Display**: `OverusedGrotesk` (Variable font).
- **Logo**: `Zen Tokyo Zoo`.

## 🛠️ Component Patterns

### 1. Primary Button (`.btn-primary`)
- **Style**: Gradient `from-primary to-primary/80`.
- **Shape**: `rounded-lg`.
- **Font**: `text-[13px] font-semibold`.
- **Interaction**: `hover:scale-[1.03]`.

### 2. Standard Input (`.input-primary`)
- **Background**: `bg-white/5` (Subtle dark glass).
- **Border**: `border-white/10`.
- **Focus**: `focus:border-white/20`.
- **Text**: `text-sm text-gray-200`.

### 3. Cards (`.card-primary`)
- **Structure**: `border border-border-dark bg-white/5 backdrop-blur-md`.
- **Hover**: `hover:border-white/20 hover:bg-white/10`.

## 🚫 Avoid These "AI Traps"
1. **Icon Overload**: Don't put an icon next to every single menu item or label unless it's a primary navigation element.
2. **Badge Spam**: Don't use colorful badges for every status. Use text color or subtle indicators.
3. **Complex Gradients**: Stick to simple linear gradients or solid colors.
4. **Vibrant Blue/Green**: Stick to the project's Purple/Pink/Zinc palette.
