import { Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import SummaryDashboardPage from "../pages/SummaryDashboardPage";

export default function PrivateRoute() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<SummaryDashboardPage />} />
      </Route>
    </Routes>
  );
}
