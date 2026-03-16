import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageSkeleton } from "@/components/RoleBasedGuard";

/**
 * Protects private routes.
 * If not authenticated → redirect to login.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <PageSkeleton />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
