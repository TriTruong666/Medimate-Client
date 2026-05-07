import { Outlet, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/hooks/useAuth";

const tabs = [
  { to: "/dashboard/settings", label: "Tổng quan", exact: true, roles: ["Admin", "User", "Doctor"] as Role[] },
  { to: "/dashboard/settings/security", label: "Bảo mật", roles: ["Admin", "User", "Doctor"] as Role[] },
  { to: "/dashboard/settings/system", label: "Hệ thống", roles: ["Admin"] as Role[] },
  { to: "/dashboard/settings/keys", label: "LLM Keys", roles: ["Admin"] as Role[] },
  { to: "/dashboard/settings/configs", label: "Cấu hình", roles: ["Admin"] as Role[] },
];

export default function SettingDashboardLayout() {
  const { user } = useAuth();

  const filteredTabs = tabs.filter((tab) => {
    if (!tab.roles) return true;
    return user ? tab.roles.includes(user.role as Role) : false;
  });

  return (
    <div className="flex flex-col space-y-8">
      {/* Tabs */}
      <div className="relative border-b border-gray-300 dark:border-white/10">
        <div className="flex overflow-x-auto no-scrollbar">
          {filteredTabs.map((tab) => (
            <TabLink key={tab.to} to={tab.to} label={tab.label} exact={tab.exact} />
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
}

function TabLink({
  to,
  icon,
  label,
  exact = false,
}: {
  to: string;
  icon?: React.ReactNode;
  label: string;
  exact?: boolean;
}) {
  return (
    <NavLink to={to} end={exact} className="relative flex-1">
      {({ isActive }) => (
        <div className="relative flex flex-col items-center">
          <div
            className={`flex w-full items-center justify-center gap-2 py-4 text-[13px] transition-colors duration-200 ${
              isActive
                ? "bg-primary/10 text-primary dark:bg-white/5 dark:text-white"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-white"
            }`}
          >
            {icon}
            {label}
          </div>

          {/* Sliding Indicator */}
          {isActive && (
            <motion.div
              layoutId="settings-tab-indicator"
              className="absolute bottom-0 left-0 h-full w-full bg-primary/10 dark:bg-white/5"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
        </div>
      )}
    </NavLink>
  );
}
