import { Route, Routes } from "react-router-dom";
import LoginLayout from "../layouts/LoginLayout";
import LoginPage from "../pages/LoginPage";
import ForgetPassPage from "../pages/ForgetPassPage";
import { NotFoundPublicPage } from "../pages/NotFoundPage";
import DoctorWelcomePage from "@/pages/demo/doctor/DoctorWelcomePage";
import { GuestGuard } from "@/components/guards/GuestGuard";

export default function PublicRoute() {
  return (
    <Routes>
      {/* Guest-only: redirect to /dashboard if already logged in */}
      <Route
        element={
          <GuestGuard>
            <LoginLayout />
          </GuestGuard>
        }
      >
        <Route index element={<LoginPage />} />
        <Route path="forget-password" element={<ForgetPassPage />} />
        <Route path="*" element={<NotFoundPublicPage />} />
      </Route>

      {/* Always accessible, even when logged in */}
      <Route path="doctor/welcome" element={<DoctorWelcomePage />} />
    </Routes>
  );
}
