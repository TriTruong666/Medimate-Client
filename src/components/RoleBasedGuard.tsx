import type { ReactNode } from "react";
import type { Role } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { FullScreenSpinner } from "@/components/custom-ui/Spinner";

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
  const { user, isLoading } = useAuth();

  // Trả về Skeleton tùy chỉnh nếu đang load
  if (isLoading) {
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
      loadingSkeleton={<FullScreenSpinner />}
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

export function MiniSkeleton() {
  return <div className="h-8 w-24 animate-pulse rounded-lg bg-white/10" />;
}

export function SidebarSkeleton() {
  return (
    <div className="mt-4 space-y-5 px-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-10 w-full animate-pulse rounded-xl bg-white/5"
        />
      ))}
    </div>
  );
}
