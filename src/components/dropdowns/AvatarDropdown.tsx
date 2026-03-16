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
    window.location.href = "/";
  };

  useClickOutside(ref, () => setOpen(false));
  useEscapeKey(() => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md transition-all hover:bg-white/10"
      >
        <HiUserCircle className="text-2xl text-gray-300" />
        <span className="hidden text-sm text-gray-200 md:block">
          {user?.fullName || "Người dùng"}
        </span>
        <HiChevronDown
          className={`text-sm transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#050505] backdrop-blur-xl"
          >
            <AvatarDropdownItem label="Tài khoản" url="/dashboard/settings" />
            <AvatarDropdownItem label="Cài đặt" url="/dashboard/settings" />
            <div className="h-px bg-white/10" />
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
  const className = `block w-full px-4 py-2 text-left text-sm transition-colors ${danger
      ? "text-red-400 hover:bg-red-500/10"
      : "text-gray-300 hover:bg-white/5 hover:text-white"
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
