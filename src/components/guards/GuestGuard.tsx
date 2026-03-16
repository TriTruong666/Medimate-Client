import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageSkeleton } from "@/components/RoleBasedGuard";

/**
 * Protects guest-only routes (login, forgot-password).
 * If already authenticated → redirect to /dashboard.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <PageSkeleton />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
