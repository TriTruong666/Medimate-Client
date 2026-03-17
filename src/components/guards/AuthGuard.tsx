import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { FullScreenSpinner } from "@/components/custom-ui/Spinner";

/**
 * Protects private routes.
 * If not authenticated → redirect to login.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <FullScreenSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
