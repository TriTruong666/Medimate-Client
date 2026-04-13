import { Outlet, NavLink } from "react-router-dom";
import { motion } from "framer-motion";

export default function SettingDashboardLayout() {
  return (
    <div className="flex flex-col space-y-8">
      {/* Tabs */}
      <div className="relative border-b border-white/10">
        <div className="flex">
          <TabLink to="/dashboard/settings" label="Tổng quan" exact />
          <TabLink to="/dashboard/settings/security" label="Bảo mật" />
          <TabLink to="/dashboard/settings/system" label="Hệ thống" />
          <TabLink to="/dashboard/settings/keys" label="LLM Keys" />
          <TabLink to="/dashboard/settings/configs" label="Cấu hình" />
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
                ? "bg-white/5 text-white"
                : "text-gray-400 transition-all hover:bg-neutral-900 hover:text-white"
            }`}
          >
            {icon}
            {label}
          </div>

          {/* Sliding Indicator */}
          {isActive && (
            <motion.div
              layoutId="settings-tab-indicator"
              className="absolute bottom-0 left-0 h-full w-full bg-white/5"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
        </div>
      )}
    </NavLink>
  );
}
