import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiChevronDown, HiUserCircle } from "react-icons/hi";
import { useClickOutside, useEscapeKey } from "../../hooks/useDropdown";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/data/useAuthHooks";
import { useCookies } from "react-cookie";

export function AvatarDropdown() {
  const [, , removeCookie] = useCookies(["token"]);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
    removeCookie("token", { path: "/" });
    localStorage.setItem("last_login", user?.fullName as string);
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  useClickOutside(ref, () => setOpen(false));
  useEscapeKey(() => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md dark:hover:bg-white/10"
      >
        <HiUserCircle className="text-2xl text-gray-400 dark:text-gray-300" />
        <span className="hidden text-sm text-gray-600 md:block dark:text-gray-200">
          {user?.fullName || "Người dùng"}
        </span>
        <HiChevronDown
          className={`text-sm text-gray-400 transition-transform dark:text-gray-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-300 bg-white backdrop-blur-xl dark:border-white/10 dark:bg-[#050505]"
          >
            <AvatarDropdownItem label="Tài khoản" url="/dashboard/settings" />
            <AvatarDropdownItem label="Cài đặt" url="/dashboard/settings" />
            <div className="h-px bg-gray-100 dark:bg-white/10" />
            <AvatarDropdownItem
              label="Đăng xuất"
              danger
              onClick={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type AvatarDropdownItemProps = {
  label: string;
  danger?: boolean;
  url?: string;
  onClick?: () => void;
};

function AvatarDropdownItem({
  label,
  danger = false,
  url,
  onClick,
}: AvatarDropdownItemProps) {
  const className = `block w-full px-4 py-2 text-left text-sm transition-colors ${
    danger
      ? "text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
  } `;

  if (url) {
    return (
      <Link to={url} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick}>
      {label}
    </button>
  );
}
