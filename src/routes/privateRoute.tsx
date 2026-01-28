import { Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import SummaryDashboardPage from "../pages/SummaryDashboardPage";
import AccountDashboardPage from "../pages/AccountDashboardPage";

export default function PrivateRoute() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<SummaryDashboardPage />} />
        <Route path="/dashboard/accounts" element={<AccountDashboardPage />} />
      </Route>
    </Routes>
  );
}
