import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { FullScreenSpinner } from "@/components/custom-ui/Spinner";
import { PATHS } from "@/config/paths";
import { useDoctorMe } from "@/hooks/data/useDoctorHooks";

/**
 * Protects guest-only routes (login, forgot-password).
 * If already authenticated → redirect to /dashboard.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const shouldFetchDoctor = isAuthenticated && user?.role === "Doctor";
    const { data: doctorProfile, isLoading: isLoadingDoctorProfile } =
        useDoctorMe(shouldFetchDoctor);

    const isDoctorInactive =
        (doctorProfile?.status || "").toLowerCase() === "inactive";

    if (isLoading || (shouldFetchDoctor && isLoadingDoctorProfile)) {
        return <FullScreenSpinner />;
    }

    if (isAuthenticated) {
        let redirectTo = PATHS.DASHBOARD.ROOT;

        if (shouldFetchDoctor) {
            redirectTo = isDoctorInactive
                ? PATHS.AUTH.DOCTOR_WELCOME
                : PATHS.DASHBOARD.DOCTOR_SUPPORT.ROOT;
        } else if (user?.role === "DoctorManager") {
            redirectTo = PATHS.DASHBOARD.APPROVE_CERTIFICATE;
        }

        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}
