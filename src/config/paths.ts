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
    PACKAGES: "/dashboard/packages",
    PACKAGES_OWNER: "/dashboard/packages/owner",
    ASSETS: {
      PRESCRIPTION: "/dashboard/assets/prescription",
      CERTIFICATE: "/dashboard/assets/certificate",
    },
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
