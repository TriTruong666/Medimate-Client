import { Route, Routes } from "react-router-dom";
import LoginLayout from "../layouts/LoginLayout";
import LoginPage from "../pages/LoginPage";
import ForgetPassPage from "../pages/ForgetPassPage";
import TestPage from "../pages/TestPage";

export default function PublicRoute() {
  return (
    <Routes>
      <Route element={<LoginLayout />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forget-password" element={<ForgetPassPage />} />
        <Route path="/test" element={<TestPage />} />
      </Route>
    </Routes>
  );
}
