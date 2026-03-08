import type { ReactNode } from "react";
import type { Role } from "../hooks/useAuth";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

interface RoleBasedGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
  isFullPage?: boolean;
  fallback?: ReactNode;
  loadingSkeleton?: ReactNode;
}

/**
 * LÕI XỬ LÝ CHUNG: RoleBasedGuard
 */
export function RoleBasedGuard({
  children,
  allowedRoles,
  isFullPage = false,
  fallback = null,
  loadingSkeleton,
}: RoleBasedGuardProps) {
  const { user, loading } = useAuth();

  // Trả về Skeleton tùy chỉnh nếu đang load
  if (loading) {
    return <>{loadingSkeleton}</>;
  }

  const hasPermission = user && allowedRoles.includes(user.role);

  if (!hasPermission) {
    if (isFullPage) {
      return <Navigate to="*" replace />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * 1. GUARD CHO TOÀN BỘ TRANG (Full Page)
 */
export function FullPageGuard({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: Role[];
}) {
  return (
    <RoleBasedGuard
      allowedRoles={allowedRoles}
      isFullPage={true}
      loadingSkeleton={<PageSkeleton />}
    >
      {children}
    </RoleBasedGuard>
  );
}

/**
 * 2. GUARD CHO SIDEBAR / MENU
 */
export function SidebarGuard({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: Role[];
}) {
  return (
    <RoleBasedGuard
      allowedRoles={allowedRoles}
      isFullPage={false}
      loadingSkeleton={<SidebarSkeleton />}
    >
      {children}
    </RoleBasedGuard>
  );
}

/**
 * 3. GUARD CHO COMPONENT NHỎ (Buttons, UI Fragments)
 */
export function ComponentGuard({
  children,
  allowedRoles,
  fallback = null,
}: {
  children: ReactNode;
  allowedRoles: Role[];
  fallback?: ReactNode;
}) {
  return (
    <RoleBasedGuard
      allowedRoles={allowedRoles}
      isFullPage={false}
      fallback={fallback}
      loadingSkeleton={<MiniSkeleton />}
    >
      {children}
    </RoleBasedGuard>
  );
}

function MiniSkeleton() {
  return <div className="h-8 w-24 animate-pulse rounded-lg bg-white/10" />;
}

function SidebarSkeleton() {
  return (
    <div className="mt-4 space-y-2 px-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-10 w-full animate-pulse rounded-xl bg-white/5"
        />
      ))}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="page-layout">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-3">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="h-10 w-64 rounded-lg bg-white/10" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 rounded-lg bg-white/10" />
          <div className="h-10 w-32 rounded-lg bg-white/10" />
        </div>
      </div>
      <div className="dark:border-border-dark overflow-hidden rounded-xl border border-white/5 bg-white/5">
        <div className="h-12 border-b border-white/5 bg-white/5" />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex h-16 items-center border-b border-white/5 px-4 last:border-0"
          >
            <div className="mr-4 h-10 w-10 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-white/10" />
              <div className="h-2 w-1/4 rounded bg-white/5" />
            </div>
            <div className="h-3 w-20 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
