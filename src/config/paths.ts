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
    RAG_DETAIL: "/dashboard/rag/:id",
    CHATBOT: "/dashboard/chatbot",
    TRANSACTION: {
      ROOT: "/dashboard/transaction",
      PAYOUTS: "/dashboard/transaction/payouts",
      USER_REFUND: "/dashboard/transaction/user-refund",
    },
    DOCTOR_REPORT: "/dashboard/doctor-report",
    CLINIC: "/dashboard/clinics",
    CLINIC_DETAIL: "/dashboard/clinics/:id",
    CLINIC_CONTRACT: "/dashboard/clinic-contracts",
    INCOME: "/dashboard/income",
    PACKAGES: {
      ROOT: "/dashboard/packages",
      PACKAGES_OWNER: "/dashboard/packages/owner",
    },
    DOCTOR_SUPPORT: {
      ROOT: "/dashboard/doctor-support",
      PENDING: "/dashboard/doctor-support/pending",
      APPROVED: "/dashboard/doctor-support/approved",
      IN_PROGRESS: "/dashboard/doctor-support/in-progress",
      HISTORY: "/dashboard/doctor-support/history",
      CONSERVATION: "/dashboard/doctor-support/:conversationId",
    },
    VIDEO_CALL: "/dashboard/video-call/:sessionId",
    INTERNAL_CHAT: {
      ROOT: "/dashboard/chat",
      CONSERVATION: "/dashboard/chat/:conversationId",
    },
    APPROVE_CERTIFICATE: "/dashboard/approve-certificate",
    APPROVE_CERTIFICATE_REJECTED: "/dashboard/approve-certificate/rejected",
    APPROVE_CERTIFICATE_APPROVED: "/dashboard/approve-certificate/approved",
    APPROVE_ACCOUNT: "/dashboard/approve-account",
    APPROVE_ACCOUNT_REJECTED: "/dashboard/approve-account/rejected",
    APPROVE_ACCOUNT_VERIFIED: "/dashboard/approve-account/verified",
    APPROVE_EXCEPTION: {
      ROOT: "/dashboard/approve-exception",
      PAST_UNAPPROVED: "/dashboard/approve-exception/past-unapproved",
      APPROVED: "/dashboard/approve-exception/approved",
    },
    DOCTOR_PROFILES: "/dashboard/doctor-profiles",
    NOTIFICATIONS: "/dashboard/notifications",
    PRESCRIPTIONS: {
      ROOT: "/dashboard/prescriptions",
      IN_PROGRESS: "/dashboard/prescriptions/in-progress",
    },
    ASSETS: {
      PRESCRIPTION: "/dashboard/assets/prescription",
      CERTIFICATE: "/dashboard/assets/certificate",
    },
    PAYOUTS: {
      ROOT: "/dashboard/transaction/payouts",
    },
    REPORT_DOCTOR: "/dashboard/report-doctor",
    SETTINGS: {
      ROOT: "/dashboard/settings",
      SECURITY: "/dashboard/settings/security",
      SYSTEM: "/dashboard/settings/system",
      KEYS: "/dashboard/settings/keys",
      CONFIG: "/dashboard/settings/configs",
    },
  },
};
