import { Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import SummaryDashboardPage from "../pages/SummaryDashboardPage";
import AccountDashboardPage from "../pages/admin/AccountDashboardPage";

import KnowledgeBasePage from "../pages/admin/KnowledgeBasePage";

import ChatbotPage from "../pages/ChatbotPage";
import TransactionDashboardPage from "../pages/TransactionDashboardPage";

import {
  AssetsCertificateDashboardPage,
  AssetsPrescriptionDashboardPage,
} from "../pages/admin/AssetsDashboardPage";
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
import { RoleBasedGuard } from "@/components/RoleBasedGuard";
import { PackageDashboardPage } from "@/pages/admin/PackageDashboardPage";
import PackageOwnerDashboardPage from "@/pages/admin/PackageOwnerDashboardPage";
import KnowledgeAddCollectionPage from "@/pages/admin/KnowledgeAddCollectionPage";
import DocumentDashboardPage from "@/pages/admin/DocumentDashboardPage";

export default function PrivateRoute() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<SummaryDashboardPage />} />

        <Route
          path="accounts"
          element={
            <RoleBasedGuard allowedRoles={["admin"]} isFullPage>
              <AccountDashboardPage />
            </RoleBasedGuard>
          }
        />

        <Route path="documents" element={<DocumentDashboardPage />} />

        <Route path="rag" element={<KnowledgeBasePage />} />
        <Route path="rag/new" element={<KnowledgeAddCollectionPage />} />
        <Route path="chatbot" element={<ChatbotPage />} />
        <Route path="transaction" element={<TransactionDashboardPage />} />

        {/* Example: Prescription is for Admin and Doctor */}
        <Route
          path="assets/prescription"
          element={
            <RoleBasedGuard allowedRoles={["admin"]} isFullPage>
              <AssetsPrescriptionDashboardPage />
            </RoleBasedGuard>
          }
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

      {/* Catch-all for any other dashboard sub-routes */}
      <Route path="*" element={<NotFoundPrivatePage />} />
    </Routes>
  );
}
