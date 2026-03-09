/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import { lazy } from "react";
import { PATHS } from "./paths";
import { FiLayout, FiUsers, FiSettings, FiFileText } from "react-icons/fi";
import { RiVipDiamondLine, RiImageAiLine } from "react-icons/ri";
import { IoSync } from "react-icons/io5";
import { AiOutlineRobot } from "react-icons/ai";
import { GrTransaction } from "react-icons/gr";
import type { Role } from "../hooks/useAuth";

// Types for Route Configuration
export interface RouteConfig {
  path: string;
  element?: ReactNode; // Nếu có route children, kiểu object[]
  layout?: "dashboard" | "settings" | "none";
  roles?: Role[];
  label?: string;
  icon?: any;
  showInSidebar?: boolean;
  children?: RouteConfig[];
  index?: boolean; // True nếu là route index
}

const SummaryDashboardPage = lazy(
  () => import("../pages/SummaryDashboardPage"),
);
const AccountDashboardPage = lazy(
  () => import("../pages/admin/AccountDashboardPage"),
);
const DocumentDashboardPage = lazy(
  () => import("../pages/admin/DocumentDashboardPage"),
);
const KnowledgeBasePage = lazy(
  () => import("../pages/admin/KnowledgeBasePage"),
);
const KnowledgeAddCollectionPage = lazy(
  () => import("../pages/admin/KnowledgeAddCollectionPage"),
);
const ChatbotPage = lazy(() => import("../pages/ChatbotPage"));
const TransactionDashboardPage = lazy(
  () => import("../pages/TransactionDashboardPage"),
);
const AssetsPrescriptionDashboardPage = lazy(() =>
  import("../pages/admin/AssetsDashboardPage").then((m) => ({
    default: m.AssetsPrescriptionDashboardPage,
  })),
);
const AssetsCertificateDashboardPage = lazy(() =>
  import("../pages/admin/AssetsDashboardPage").then((m) => ({
    default: m.AssetsCertificateDashboardPage,
  })),
);
const PackageDashboardPage = lazy(() =>
  import("../pages/admin/PackageDashboardPage").then((m) => ({
    default: m.PackageDashboardPage,
  })),
);
const PackageOwnerDashboardPage = lazy(
  () => import("@/pages/admin/PackageOwnerDashboardPage"),
);

const ProfileSettingDashboardPage = lazy(() =>
  import("../pages/SettingDashboardPage").then((m) => ({
    default: m.ProfileSettingDashboardPage,
  })),
);
const SecuritySettingDashboardPage = lazy(() =>
  import("../pages/SettingDashboardPage").then((m) => ({
    default: m.SecuritySettingDashboardPage,
  })),
);
const NotificationSettingDashboardPage = lazy(() =>
  import("../pages/SettingDashboardPage").then((m) => ({
    default: m.NotificationSettingDashboardPage,
  })),
);
const MessageSettingDashboardPage = lazy(() =>
  import("../pages/SettingDashboardPage").then((m) => ({
    default: m.MessageSettingDashboardPage,
  })),
);
const SystemSettingDashboardPage = lazy(() =>
  import("../pages/SettingDashboardPage").then((m) => ({
    default: m.SystemSettingDashboardPage,
  })),
);
const APIKeysSettingDashboardPage = lazy(() =>
  import("../pages/SettingDashboardPage").then((m) => ({
    default: m.APIKeysSettingDashboardPage,
  })),
);

export const ROUTES_CONFIG: RouteConfig[] = [
  {
    path: PATHS.DASHBOARD.ROOT,
    element: <SummaryDashboardPage />,
    layout: "dashboard",
    label: "Tổng quan",
    icon: FiLayout,
    showInSidebar: true,
    roles: ["admin", "user", "doctor"],
    index: true,
  },
  {
    path: PATHS.DASHBOARD.ACCOUNTS,
    element: <AccountDashboardPage />,
    layout: "dashboard",
    label: "Tài khoản",
    icon: FiUsers,
    showInSidebar: true,
    roles: ["admin"],
  },
  {
    path: PATHS.DASHBOARD.TRANSACTION,
    element: <TransactionDashboardPage />,
    layout: "dashboard",
    label: "Giao dịch",
    icon: GrTransaction,
    showInSidebar: true,
    roles: ["admin", "user", "doctor"],
  },
  {
    path: PATHS.DASHBOARD.DOCUMENTS,
    layout: "dashboard",
    label: "Tài liệu",
    icon: FiFileText,
    showInSidebar: true,
    roles: ["admin"],
    children: [
      {
        path: PATHS.DASHBOARD.DOCUMENTS,
        element: <DocumentDashboardPage />,
        label: "Tất cả",
        index: true,
      },
      {
        path: `${PATHS.DASHBOARD.DOCUMENTS}/uploaded`,
        element: <DocumentDashboardPage />,
        label: "Vừa tải lên",
      },
      {
        path: `${PATHS.DASHBOARD.DOCUMENTS}/indexed`,
        element: <DocumentDashboardPage />,
        label: "Đã nạp",
      },
    ],
  },
  {
    path: PATHS.DASHBOARD.PACKAGES,
    layout: "dashboard",
    label: "Gói dịch vụ",
    icon: RiVipDiamondLine,
    showInSidebar: true,
    roles: ["admin"],
    children: [
      {
        path: PATHS.DASHBOARD.PACKAGES,
        element: <PackageDashboardPage />,
        label: "Quản lý gói",
        index: true,
      },
      {
        path: PATHS.DASHBOARD.PACKAGES_OWNER,
        element: <PackageOwnerDashboardPage />,
        label: "Danh sách hội viên",
      },
    ],
  },
  {
    path: "/dashboard/assets",
    layout: "dashboard",
    label: "Thư viện",
    icon: RiImageAiLine,
    showInSidebar: true,
    roles: ["admin"],
    children: [
      {
        path: PATHS.DASHBOARD.ASSETS.PRESCRIPTION,
        element: <AssetsPrescriptionDashboardPage />,
        label: "Toa thuốc",
      },
      {
        path: PATHS.DASHBOARD.ASSETS.CERTIFICATE,
        element: <AssetsCertificateDashboardPage />,
        label: "Chứng chỉ bác sĩ",
      },
    ],
  },
  {
    path: PATHS.DASHBOARD.RAG,
    element: <KnowledgeBasePage />,
    layout: "dashboard",
    label: "RAG Core",
    icon: IoSync,
    showInSidebar: true,
    roles: ["admin"],
  },
  {
    path: PATHS.DASHBOARD.RAG_NEW,
    element: <KnowledgeAddCollectionPage />,
    layout: "dashboard",
    showInSidebar: false,
    roles: ["admin"],
  },
  {
    path: PATHS.DASHBOARD.CHATBOT,
    element: <ChatbotPage />,
    layout: "dashboard",
    label: "Chatbot",
    icon: AiOutlineRobot,
    showInSidebar: true,
    roles: ["admin", "user", "doctor"],
  },

  // Settings Routes
  {
    path: PATHS.DASHBOARD.SETTINGS.ROOT,
    element: <ProfileSettingDashboardPage />,
    layout: "settings",
    label: "Cài đặt hồ sơ",
    icon: FiSettings,
    showInSidebar: false,
    roles: ["admin", "user", "doctor"],
    index: true,
  },
  {
    path: PATHS.DASHBOARD.SETTINGS.SECURITY,
    element: <SecuritySettingDashboardPage />,
    layout: "settings",
    roles: ["admin", "user", "doctor"],
  },
  {
    path: PATHS.DASHBOARD.SETTINGS.NOTIFICATION,
    element: <NotificationSettingDashboardPage />,
    layout: "settings",
    roles: ["admin", "user", "doctor"],
  },
  {
    path: PATHS.DASHBOARD.SETTINGS.MESSAGE,
    element: <MessageSettingDashboardPage />,
    layout: "settings",
    roles: ["admin", "user", "doctor"],
  },
  {
    path: PATHS.DASHBOARD.SETTINGS.SYSTEM,
    element: <SystemSettingDashboardPage />,
    layout: "settings",
    roles: ["admin", "user", "doctor"],
  },
  {
    path: PATHS.DASHBOARD.SETTINGS.KEYS,
    element: <APIKeysSettingDashboardPage />,
    layout: "settings",
    roles: ["admin", "user", "doctor"],
  },
];

export const getSidebarNavigation = () => {
  return ROUTES_CONFIG.filter((route) => route.showInSidebar);
};
