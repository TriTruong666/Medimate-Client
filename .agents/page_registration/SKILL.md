---
name: page_registration
description: "Workflow for creating, styling, and registering new pages in the Picare OMS dashboard."
---

# New Page Creation & Registration Workflow

Follow these steps strictly when adding a new page to the Picare OMS project to ensure consistent routing, breadcrumbs, and layout. Avoid errors like broken routes or layout mismatches by following this standardized process.

## 🛠️ Step 1: Define the Path Constants
All paths MUST be centralized in `src/config/paths.ts`. This avoids "magic strings" and makes navigation consistent across the app.

1. Open `src/config/paths.ts`.
2. Add your new page path inside the `DASHBOARD` object.
3. Use `UPPERCASE_SNAKE_CASE` for the key and `lowercase/slashes` for the value.

**Example:**
```typescript
COMPANY_ADD: "/dashboard/company/add",
COMPANY_EDIT: "/dashboard/company/edit/:companyId",
```

## 📄 Step 2: Create the Page Component
Create your page in the appropriate subfolder within `src/pages/`.
- Use the `@/components/custom-ui/Breadcrumb` component for navigation.
- Follow the **Picare UI** aesthetic: Dark colors, Glassmorphism, and high-end typography.
- Use `useNavigate` from `react-router-dom` for navigation actions.

**Standard Template (`src/pages/MyNewPage.tsx`):**
```tsx
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { PATHS } from "@/config/paths";
import { motion } from "framer-motion";

const breadcrumbItems = [
  { label: "Dashboard", path: PATHS.DASHBOARD.ROOT },
  { label: "Trang cha", path: PATHS.DASHBOARD.PARENT_ROOT },
  { label: "Tên trang hiện tại" },
];

export default function MyNewPage() {
  return (
    <div className="page-layout">
      {/* Header Section */}
      <div className="mb-6 flex flex-col">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Tiêu đề trang
        </h1>
      </div>

      {/* Content Area - Typically wrapped in motion for smooth entry */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          {/* Your UI Components */}
        </div>
      </motion.div>
    </div>
  );
}
```

## 🚦 Step 3: Register Lazy Import & ROUTES_CONFIG
Routing logic is central in `src/config/routes.config.tsx`.

1. **Lazy Import**: Use absolute `@/pages/...` alias. Use `lazy` for all page-level components to code-split.
   ```tsx
   const MyNewPage = lazy(() => import("@/pages/admin/MyNewPage"));
   ```
2. **ROUTES_CONFIG**: Add a new route object to the relevant group.
   - `path`: Use your constant from `PATHS.DASHBOARD.X`.
   - `element`: `<MyNewPage />`.
   - `layout`: `"dashboard"` (uses `DashboardLayout`) or `"settings"` (uses `SettingDashboardLayout`).
   - `roles`: Define who can access (e.g., `["Admin"]`).
   - `showInSidebar`: `true` if it should appear in the primary navigation.

**Example Route Object:**
```tsx
{
  path: PATHS.DASHBOARD.MY_NEW_PAGE,
  element: <MyNewPage />,
  layout: "dashboard",
  label: "Nhãn menu",
  icon: FiSettings, // From react-icons/fi
  showInSidebar: true,
  roles: ["Admin"],
},
```

## ⚠️ Critical Checks & Common Errors
> [!WARNING]
> If you create a page and get a **404 Not Found**, check these 5 things:
> 1. **Typo in Path**: Does `PATHS.DASHBOARD.X` in `routes.config.tsx` match the URL you are typing?
> 2. **Role Guard**: Is your current user logged in with a role listed in the `roles: [...]` array of the route?
> 3. **Vite Cache**: Often, adding new routes and lazy imports confuses the dev server. **Stop the server (`Ctrl+C`) and run `npm run dev` again**.
> 4. **Import Errors**: Check the console. If `@/pages/X` cannot be resolved, ensure the filename casing matches exactly.
> 5. **Route Nesting**: Prefer flat routes in `ROUTES_CONFIG` unless you explicitly need complex layout inheritance.

## 🎨 Styling Checklist
- [ ] Header has `tracking-tight` and `font-bold`.
- [ ] Container background uses `bg-white/2` or `bg-white/5` with `backdrop-blur`.
- [ ] Borders use `border-white/10` or `border-white/5`.
- [ ] All inputs use `.input-primary` from `index.css`.
- [ ] Success/Error feedback uses `toast` from `@/hooks/useToast`.
