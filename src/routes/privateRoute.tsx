import { Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import SummaryDashboardPage from "../pages/SummaryDashboardPage";
import AccountDashboardPage from "../pages/AccountDashboardPage";
import DocumentDashboardPage from "../pages/DocumentDashboardPage";
import KnowledgeBasePage from "../pages/KnowledgeBasePage";
import KnowledgeAddCollectionPage from "../pages/KnowledgeAddCollectionPage";
import ChatbotPage from "../pages/ChatbotPage";
import TransactionDashboardPage from "../pages/TransactionDashboardPage";
import AssetsDashboardPage from "../pages/AssetsDashboardPage";
import { PackageDashboardPage } from "../pages/PackageDashboardPage";
import PackageOwnerDashboardPage from "../pages/PackageOwnerDashboardPage";

export default function PrivateRoute() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<SummaryDashboardPage />} />
        <Route path="/dashboard/accounts" element={<AccountDashboardPage />} />
        <Route
          path="/dashboard/documents"
          element={<DocumentDashboardPage />}
        />

        <Route path="/dashboard/rag" element={<KnowledgeBasePage />} />
        <Route
          path="/dashboard/rag/new"
          element={<KnowledgeAddCollectionPage />}
        />
        <Route path="/dashboard/chatbot" element={<ChatbotPage />} />
        <Route
          path="/dashboard/transaction"
          element={<TransactionDashboardPage />}
        />
        <Route path="/dashboard/assets" element={<AssetsDashboardPage />} />
        <Route path="/dashboard/packages" element={<PackageDashboardPage />} />
        <Route
          path="/dashboard/packages/owner"
          element={<PackageOwnerDashboardPage />}
        />
      </Route>
    </Routes>
  );
}
