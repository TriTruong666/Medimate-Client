import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { FullScreenSpinner } from "@/components/custom-ui/Spinner";

/**
 * Protects guest-only routes (login, forgot-password).
 * If already authenticated → redirect to /dashboard.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <FullScreenSpinner />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
