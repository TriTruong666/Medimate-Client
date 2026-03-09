import { Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import type { ReactNode } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import SettingDashboardLayout from "../layouts/SettingDashboardLayout";
import { NotFoundPrivatePage } from "../pages/NotFoundPage";
import { FullPageGuard } from "@/components/RoleBasedGuard";
import { ROUTES_CONFIG } from "@/config/routes.config";
import type { RouteConfig } from "@/config/routes.config";

export default function PrivateRoute() {
  // Helper to remove /dashboard prefix for nested routing
  const getRelativePath = (path: string) => {
    return path
      .replace("/dashboard/", "")
      .replace("/dashboard", "")
      .replace(/^\//, "");
  };

  const renderRouteElement = (route: RouteConfig): ReactNode => {
    if (!route.element) return null;

    return route.roles ? (
      <FullPageGuard allowedRoles={route.roles}>{route.element}</FullPageGuard>
    ) : (
      route.element
    );
  };

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {ROUTES_CONFIG.filter((r) => r.layout === "dashboard").map((route) => {
          const relativePath = getRelativePath(route.path);

          // If it has children, render them
          if (route.children) {
            return (
              <Route key={route.path} path={relativePath || undefined}>
                {route.children.map((child) => {
                  const childRelativePath = getRelativePath(child.path);
                  return (
                    <Route
                      key={child.path}
                      index={child.index}
                      path={child.index ? undefined : childRelativePath}
                      element={renderRouteElement(child)}
                    />
                  );
                })}
              </Route>
            );
          }

          return (
            <Route
              key={route.path}
              index={route.index || relativePath === ""}
              path={route.index ? undefined : relativePath}
              element={renderRouteElement(route)}
            />
          );
        })}

        <Route element={<SettingDashboardLayout />}>
          {ROUTES_CONFIG.filter((r) => r.layout === "settings").map((route) => {
            const relativePath = getRelativePath(route.path);
            return (
              <Route
                key={route.path}
                index={route.index}
                path={route.index ? undefined : relativePath}
                element={renderRouteElement(route)}
              />
            );
          })}
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPrivatePage />} />
    </Routes>
  );
}
