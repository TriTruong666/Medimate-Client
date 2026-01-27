import { Route, Routes } from "react-router-dom";
import LoginLayout from "../layouts/LoginLayout";
import LoginPage from "../pages/LoginPage";

export default function PublicRoute() {
  return (
    <Routes>
      <Route element={<LoginLayout />}>
        <Route path="/" element={<LoginPage />} />
      </Route>
    </Routes>
  );
}
