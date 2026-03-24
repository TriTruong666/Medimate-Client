/**
 * Centralized paths for the application.
 * Using constants helps avoid magic strings and makes it easier to refactor.
 */
export const PATHS = {
  // Public Paths
  AUTH: {
    LOGIN: "/",
    FORGOT_PASSWORD: "/forget-password",
    DOCTOR_WELCOME: "/doctor/welcome",
  },

  // Private Paths (Dashboard)
  DASHBOARD: {
    ROOT: "/dashboard",
    ACCOUNTS: "/dashboard/accounts",
    DOCUMENTS: "/dashboard/documents",
    RAG: "/dashboard/rag",
    RAG_NEW: "/dashboard/rag/new",
    CHATBOT: "/dashboard/chatbot",
    TRANSACTION: "/dashboard/transaction",
    DOCTOR_REPORT: "/dashboard/doctor-report",
    DOCTOR_CONTRACT: "/dashboard/doctor-contract",
    INCOME: "/dashboard/income",
    PACKAGES: {
      ROOT: "/dashboard/packages",
      PACKAGES_OWNER: "/dashboard/packages/owner",
    },
    DOCTOR_SUPPORT: {
      ROOT: "/dashboard/doctor-support",
      CONSERVATION: "/dashboard/doctor-support/:conversationId",
    },
    INTERNAL_CHAT: {
      ROOT: "/dashboard/chat",
      CONSERVATION: "/dashboard/chat/:conversationId",
    },
    APPROVE_CERTIFICATE: "/dashboard/approve-certificate",
    APPROVE_CERTIFICATE_REJECTED: "/dashboard/approve-certificate/rejected",
    APPROVE_CERTIFICATE_APPROVED: "/dashboard/approve-certificate/approved",
    NOTIFICATIONS: "/dashboard/notifications",
    ASSETS: {
      PRESCRIPTION: "/dashboard/assets/prescription",
      CERTIFICATE: "/dashboard/assets/certificate",
    },
    REPORT_DOCTOR: "/dashboard/report-doctor",
    SETTINGS: {
      ROOT: "/dashboard/settings",
      SECURITY: "/dashboard/settings/security",
      NOTIFICATION: "/dashboard/settings/notification",
      MESSAGE: "/dashboard/settings/message",
      SYSTEM: "/dashboard/settings/system",
      KEYS: "/dashboard/settings/keys",
    },
  },
};
