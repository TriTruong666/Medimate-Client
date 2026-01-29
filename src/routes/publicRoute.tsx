import { Route, Routes } from "react-router-dom";
import LoginLayout from "../layouts/LoginLayout";
import LoginPage from "../pages/LoginPage";
import Welcome from "../components/Welcome";

export default function PublicRoute() {
  return (
    <Routes>
      <Route element={<LoginLayout />}>
        <Route path="/" element={<LoginPage />} />
      </Route>
      <Route path="/test-welcome" element={<Welcome />} />
    </Routes>
  );
}
