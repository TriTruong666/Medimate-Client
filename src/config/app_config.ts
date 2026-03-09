import { PATHS } from "./paths";
import { getSidebarNavigation } from "./routes.config";

export const APP_CONFIG = {
  // 1. Branding
  brand: {
    name: "Medimate",
    logo: "/assets/medimate-logo.png",
  },

  // 2. Navigation (Pulled from centralized route config to maintain single source of truth)
  navigation: getSidebarNavigation(),

  // 3. API & Auth
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "https://api.example.com",
    timeout: 10000,
  },

  // 4. UI/Theme
  theme: {
    primaryColor: "#3b82f6",
    sidebarMode: "dark" as "dark" | "light",
  },

  // 5. Shared Paths
  paths: PATHS,
};

export type AppConfig = typeof APP_CONFIG;
