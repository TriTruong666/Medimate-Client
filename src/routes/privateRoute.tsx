import { Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import SummaryDashboardPage from "../pages/SummaryDashboardPage";
import AccountDashboardPage from "../pages/AccountDashboardPage";
import DocumentDashboardPage from "../pages/DocumentDashboardPage";
import KnowledgeBasePage from "../pages/KnowledgeBasePage";
import KnowledgeAddCollectionPage from "../pages/KnowledgeAddCollectionPage";
import ChatbotPage from "../pages/ChatbotPage";
import TransactionDashboardPage from "../pages/TransactionDashboardPage";
import { PackageDashboardPage } from "../pages/PackageDashboardPage";
import PackageOwnerDashboardPage from "../pages/PackageOwnerDashboardPage";
import {
  AssetsCertificateDashboardPage,
  AssetsPrescriptionDashboardPage,
} from "../pages/AssetsDashboardPage";
import SettingDashboardLayout from "../layouts/SettingDashboardLayout";
import {
  APIKeysSettingDashboardPage,
  MessageSettingDashboardPage,
  NotificationSettingDashboardPage,
  ProfileSettingDashboardPage,
  SecuritySettingDashboardPage,
  SystemSettingDashboardPage,
} from "../pages/SettingDashboardPage";
import { NotFoundPrivatePage } from "../pages/NotFoundPage";

export default function PrivateRoute() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<SummaryDashboardPage />} />
        <Route path="accounts" element={<AccountDashboardPage />} />
        <Route path="documents" element={<DocumentDashboardPage />} />

        <Route path="rag" element={<KnowledgeBasePage />} />
        <Route path="rag/new" element={<KnowledgeAddCollectionPage />} />
        <Route path="chatbot" element={<ChatbotPage />} />
        <Route path="transaction" element={<TransactionDashboardPage />} />
        <Route
          path="assets/prescription"
          element={<AssetsPrescriptionDashboardPage />}
        />
        <Route
          path="assets/certificate"
          element={<AssetsCertificateDashboardPage />}
        />
        <Route path="packages" element={<PackageDashboardPage />} />
        <Route path="packages/owner" element={<PackageOwnerDashboardPage />} />
        <Route element={<SettingDashboardLayout />}>
          <Route path="settings" element={<ProfileSettingDashboardPage />} />
          <Route
            path="settings/security"
            element={<SecuritySettingDashboardPage />}
          />
          <Route
            path="settings/notification"
            element={<NotificationSettingDashboardPage />}
          />
          <Route
            path="settings/message"
            element={<MessageSettingDashboardPage />}
          />
          <Route
            path="settings/system"
            element={<SystemSettingDashboardPage />}
          />
          <Route
            path="settings/keys"
            element={<APIKeysSettingDashboardPage />}
          />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPrivatePage />} />
    </Routes>
  );
}
