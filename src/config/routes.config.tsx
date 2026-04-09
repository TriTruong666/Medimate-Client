/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import { lazy } from "react";
import { PATHS } from "./paths";
import {
  FiLayout,
  FiUsers,
  FiSettings,
  FiFileText,
  FiUserCheck,
  FiCalendar,
} from "react-icons/fi";
import { RiVipDiamondLine, RiImageAiLine } from "react-icons/ri";
import { IoBriefcaseOutline, IoSync } from "react-icons/io5";
import { AiOutlineRobot } from "react-icons/ai";
import { GrTransaction } from "react-icons/gr";
import { LiaFileContractSolid } from "react-icons/lia";
import { VscFeedback } from "react-icons/vsc";
import type { Role } from "@/hooks/useAuth";
import DoctorSupportPage from "@/pages/doctor/DoctorSupportPage";
import DoctorVideoCallPage from "@/pages/doctor/DoctorVideoCallPage";
import DoctorContractPage from "@/pages/admin/DoctorContractPage";
import DoctorProfilesPage from "@/pages/doctor-manager/DoctorProfilesPage";
import DoctorReportPage from "@/pages/admin/DoctorReportPage";
import CertificateApprovePage from "@/pages/doctor-manager/CertificateApprovePage";
import AccountApprovePage from "@/pages/doctor-manager/AccountApprovePage";
import DoctorExceptionApprovePage from "@/pages/doctor-manager/DoctorExceptionApprovePage";

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
const KnowledgeDetailCollectionPage = lazy(
  () => import("../pages/admin/KnowledgeDetailCollectionPage"),
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
const PrescriptionRootPage = lazy(
  () => import("../pages/doctor/PrescriptionRootPage"),
);
const PrescriptionInProgressPage = lazy(
  () => import("@/pages/doctor/PrescriptionInProgressPage"),
);

export const ROUTES_CONFIG: RouteConfig[] = [
  {
    path: PATHS.DASHBOARD.ROOT,
    element: <SummaryDashboardPage />,
    layout: "dashboard",
    label: "Tổng quan",
    icon: FiLayout,
    showInSidebar: true,
    roles: ["Admin", "User"],
    index: true,
  },
  {
    path: PATHS.DASHBOARD.APPROVE_CERTIFICATE,
    layout: "dashboard",
    label: "Duyệt hồ sơ",
    icon: FiUserCheck,
    showInSidebar: true,
    roles: ["DoctorManager"],
    children: [
      {
        path: PATHS.DASHBOARD.APPROVE_CERTIFICATE,
        element: <CertificateApprovePage />,
        label: "Hồ sơ chưa duyệt",
        index: true,
      },
      {
        path: PATHS.DASHBOARD.APPROVE_CERTIFICATE_REJECTED,
        element: <CertificateApprovePage />,
        label: "Hồ sơ bị từ chối",
      },
      {
        path: PATHS.DASHBOARD.APPROVE_CERTIFICATE_APPROVED,
        element: <CertificateApprovePage />,
        label: "Hồ sơ được duyệt",
      },
    ],
  },
  {
    path: PATHS.DASHBOARD.APPROVE_ACCOUNT,
    layout: "dashboard",
    label: "Duyệt thông tin bác sĩ",
    icon: FiUserCheck,
    showInSidebar: true,
    roles: ["DoctorManager"],
    children: [
      {
        path: PATHS.DASHBOARD.APPROVE_ACCOUNT,
        element: <AccountApprovePage />,
        label: "Tài khoản chờ duyệt",
        index: true,
      },
      {
        path: PATHS.DASHBOARD.APPROVE_ACCOUNT_REJECTED,
        element: <AccountApprovePage />,
        label: "Tài khoản bị từ chối",
      },
      {
        path: PATHS.DASHBOARD.APPROVE_ACCOUNT_VERIFIED,
        element: <AccountApprovePage />,
        label: "Thông tin được duyệt",
      },
    ],
  },
  {
    path: PATHS.DASHBOARD.APPROVE_EXCEPTION.ROOT,
    layout: "dashboard",
    label: "Duyệt lịch nghỉ",
    icon: FiCalendar,
    showInSidebar: true,
    roles: ["DoctorManager"],
    children: [
      {
        path: PATHS.DASHBOARD.APPROVE_EXCEPTION.ROOT,
        element: <DoctorExceptionApprovePage />,
        label: "Chưa duyệt",
        index: true,
      },
      {
        path: PATHS.DASHBOARD.APPROVE_EXCEPTION.PAST_UNAPPROVED,
        element: <DoctorExceptionApprovePage />,
        label: "Không duyệt",
      },
      {
        path: PATHS.DASHBOARD.APPROVE_EXCEPTION.APPROVED,
        element: <DoctorExceptionApprovePage />,
        label: "Đã duyệt",
      },
    ],
  },
  {
    path: PATHS.DASHBOARD.DOCTOR_PROFILES,
    element: <DoctorProfilesPage />,
    layout: "dashboard",
    label: "Danh sách bác sĩ",
    icon: FiUsers,
    showInSidebar: true,
    roles: ["DoctorManager"],
  },
  {
    path: PATHS.DASHBOARD.DOCTOR_SUPPORT.ROOT,
    layout: "dashboard",
    label: "Công việc",
    icon: IoBriefcaseOutline,
    showInSidebar: true,
    roles: ["Doctor"],
    children: [
      {
        path: PATHS.DASHBOARD.DOCTOR_SUPPORT.ROOT,
        element: <DoctorSupportPage filter="all" title="Tất cả công việc" />,
        label: "Tất cả công việc",
        index: true,
      },
      {
        path: PATHS.DASHBOARD.DOCTOR_SUPPORT.PENDING,
        element: (
          <DoctorSupportPage filter="pending" title="Công việc cần duyệt" />
        ),
        label: "Cần duyệt",
      },
      {
        path: PATHS.DASHBOARD.DOCTOR_SUPPORT.APPROVED,
        element: (
          <DoctorSupportPage filter="approved" title="Công việc sắp diễn ra" />
        ),
        label: "Sắp diễn ra",
      },
      {
        path: PATHS.DASHBOARD.DOCTOR_SUPPORT.IN_PROGRESS,
        element: (
          <DoctorSupportPage
            filter="inprogress"
            title="Công việc đến giờ hẹn"
          />
        ),
        label: "Đến giờ hẹn",
      },
      {
        path: PATHS.DASHBOARD.DOCTOR_SUPPORT.HISTORY,
        element: (
          <DoctorSupportPage filter="history" title="Lịch sử công việc" />
        ),
        label: "Lịch sử",
      },
    ],
  },
  {
    path: PATHS.DASHBOARD.PRESCRIPTIONS.ROOT,
    layout: "dashboard",
    label: "Phiên và Đơn thuốc",
    icon: FiFileText,
    showInSidebar: true,
    roles: ["Doctor"],
    children: [
      {
        path: PATHS.DASHBOARD.PRESCRIPTIONS.ROOT,
        element: <PrescriptionRootPage />,
        label: "Phiên tư vấn",
        index: true,
      },
      {
        path: PATHS.DASHBOARD.PRESCRIPTIONS.IN_PROGRESS,
        element: <PrescriptionInProgressPage />,
        label: "Đang khám",
        showInSidebar: false,
      },
    ],
  },
  {
    path: PATHS.DASHBOARD.VIDEO_CALL,
    element: <DoctorVideoCallPage />,
    layout: "dashboard",
    roles: ["Doctor", "DoctorManager", "Admin"],
    showInSidebar: false,
  },
  {
    path: PATHS.DASHBOARD.ACCOUNTS,
    element: <AccountDashboardPage />,
    layout: "dashboard",
    label: "Tài khoản",
    icon: FiUsers,
    showInSidebar: true,
    roles: ["Admin"],
  },
  {
    path: PATHS.DASHBOARD.TRANSACTION,
    element: <TransactionDashboardPage />,
    layout: "dashboard",
    label: "Giao dịch",
    icon: GrTransaction,
    showInSidebar: true,
    roles: ["Admin", "User", "Doctor"],
  },
  {
    path: PATHS.DASHBOARD.DOCUMENTS,
    layout: "dashboard",
    label: "Tài liệu",
    icon: FiFileText,
    showInSidebar: true,
    roles: ["Admin"],
    element: <DocumentDashboardPage />,
  },
  {
    path: PATHS.DASHBOARD.PACKAGES.ROOT,
    layout: "dashboard",
    label: "Gói dịch vụ",
    icon: RiVipDiamondLine,
    showInSidebar: true,
    roles: ["Admin"],
    children: [
      {
        path: PATHS.DASHBOARD.PACKAGES.ROOT,
        element: <PackageDashboardPage />,
        label: "Quản lý gói",
        index: true,
      },
      {
        path: PATHS.DASHBOARD.PACKAGES.PACKAGES_OWNER,
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
    roles: ["Admin"],
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
    roles: ["Admin"],
  },
  {
    path: PATHS.DASHBOARD.RAG_NEW,
    element: <KnowledgeAddCollectionPage />,
    layout: "dashboard",
    showInSidebar: false,
    roles: ["Admin"],
  },
  {
    path: PATHS.DASHBOARD.RAG_DETAIL,
    element: <KnowledgeDetailCollectionPage />,
    layout: "dashboard",
    showInSidebar: false,
    roles: ["Admin"],
  },
  {
    path: PATHS.DASHBOARD.CHATBOT,
    element: <ChatbotPage />,
    layout: "dashboard",
    label: "Chatbot",
    icon: AiOutlineRobot,
    showInSidebar: true,
    roles: ["Admin"],
  },
  {
    path: PATHS.DASHBOARD.DOCTOR_CONTRACT,
    element: <DoctorContractPage />,
    layout: "dashboard",
    label: "Hợp đồng",
    icon: LiaFileContractSolid,
    showInSidebar: true,
    roles: ["Admin"],
  },
  {
    path: PATHS.DASHBOARD.DOCTOR_REPORT,
    element: <DoctorReportPage />,
    layout: "dashboard",
    label: "Báo cáo bác sĩ",
    icon: VscFeedback,
    showInSidebar: true,
    roles: ["Admin"],
  },

  // Settings Routes
  {
    path: PATHS.DASHBOARD.SETTINGS.ROOT,
    element: <ProfileSettingDashboardPage />,
    layout: "settings",
    label: "Cài đặt hồ sơ",
    icon: FiSettings,
    showInSidebar: false,
    roles: ["Admin", "User", "Doctor"],
  },
  {
    path: PATHS.DASHBOARD.SETTINGS.SECURITY,
    element: <SecuritySettingDashboardPage />,
    layout: "settings",
    roles: ["Admin", "User", "Doctor"],
  },
  {
    path: PATHS.DASHBOARD.SETTINGS.NOTIFICATION,
    element: <NotificationSettingDashboardPage />,
    layout: "settings",
    roles: ["Admin", "User", "Doctor"],
  },
  {
    path: PATHS.DASHBOARD.SETTINGS.MESSAGE,
    element: <MessageSettingDashboardPage />,
    layout: "settings",
    roles: ["Admin", "User", "Doctor"],
  },
  {
    path: PATHS.DASHBOARD.SETTINGS.SYSTEM,
    element: <SystemSettingDashboardPage />,
    layout: "settings",
    roles: ["Admin", "User", "Doctor"],
  },
  {
    path: PATHS.DASHBOARD.SETTINGS.KEYS,
    element: <APIKeysSettingDashboardPage />,
    layout: "settings",
    roles: ["Admin", "User", "Doctor"],
  },
];

export const getSidebarNavigation = () => {
  return ROUTES_CONFIG.filter((route) => route.showInSidebar);
};
