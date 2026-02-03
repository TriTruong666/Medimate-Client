import { Route, Routes } from "react-router-dom";
import LoginLayout from "../layouts/LoginLayout";
import LoginPage from "../pages/LoginPage";
import Welcome from "../components/Welcome";
import ForgetPassPage from "../pages/ForgetPassPage";

export default function PublicRoute() {
  return (
    <Routes>
      <Route element={<LoginLayout />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forget-password" element={<ForgetPassPage />} />
      </Route>
    </Routes>
  );
}
