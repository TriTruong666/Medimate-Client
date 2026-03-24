import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { FullScreenSpinner } from "@/components/custom-ui/Spinner";
import { PATHS } from "@/config/paths";

/**
 * Protects guest-only routes (login, forgot-password).
 * If already authenticated → redirect to /dashboard.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <FullScreenSpinner />;
    }

    if (isAuthenticated) {
        const redirectTo =
            user?.role === "DoctorManager"
                ? PATHS.DASHBOARD.APPROVE_CERTIFICATE
                : PATHS.DASHBOARD.ROOT;

        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}
