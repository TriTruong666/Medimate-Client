import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { FullScreenSpinner } from "@/components/custom-ui/Spinner";
import { PATHS } from "@/config/paths";
import { useDoctorMe } from "@/hooks/data/useDoctorHooks";

/**
 * Protects private routes.
 * If not authenticated → redirect to login.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const shouldFetchDoctor = isAuthenticated && user?.role === "Doctor";
    const { data: doctorProfile, isLoading: isLoadingDoctorProfile } =
        useDoctorMe(shouldFetchDoctor);

    const isDoctorInactive =
        (doctorProfile?.status || "").toLowerCase() === "inactive";

    if (isLoading || (shouldFetchDoctor && isLoadingDoctorProfile)) {
        return <FullScreenSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to={PATHS.AUTH.LOGIN} replace />;
    }

    if (shouldFetchDoctor && isDoctorInactive) {
        return <Navigate to={PATHS.AUTH.DOCTOR_WELCOME} replace />;
    }

    return <>{children}</>;
}
