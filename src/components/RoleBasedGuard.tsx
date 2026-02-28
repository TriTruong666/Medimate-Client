import type { ReactNode } from "react";
import type { Role } from "../hooks/useAuth";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

interface RoleBasedGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
  /**
   * If true, it will redirect to /dashboard/not-found or the specified fallback path.
   * Useful for protecting entire pages.
   */
  isFullPage?: boolean;
  /**
   * If provided, will be shown when the user doesn't have the required role.
   * Only used when isFullPage is false.
   */
  fallback?: ReactNode;
}

/**
 * RoleBasedGuard component to restrict access to certain features/pages based on user roles.
 */
export function RoleBasedGuard({
  children,
  allowedRoles,
  isFullPage = false,
  fallback = null,
}: RoleBasedGuardProps) {
  const { user, loading } = useAuth();

  // Wait for auth to load
  if (loading) {
    return null;
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
