import { Route, Routes } from "react-router-dom";
import LoginLayout from "../layouts/LoginLayout";
import LoginPage from "../pages/LoginPage";
import ForgetPassPage from "../pages/ForgetPassPage";
import TestPage from "../pages/TestPage";
import { NotFoundPublicPage } from "../pages/NotFoundPage";

export default function PublicRoute() {
  return (
    <Routes>
      <Route element={<LoginLayout />}>
        <Route index element={<LoginPage />} />
        <Route path="forget-password" element={<ForgetPassPage />} />

        <Route path="*" element={<NotFoundPublicPage />} />
      </Route>
      <Route path="test" element={<TestPage />} />
    </Routes>
  );
}
