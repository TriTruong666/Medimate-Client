import { getSidebarNavigation } from "@/config/routes.config";
import type { RouteConfig } from "@/config/routes.config";
import {
  HiOutlineQuestionMarkCircle,
  HiChevronDown,
  HiSearch,
} from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import medimateLogo from "../assets/medimate-logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState, useRef } from "react";
import Lenis from "lenis";

import { ToastContainer } from "../components/ToastContainer";
import { NavLink, Outlet } from "react-router-dom";
import ModalContainer from "../components/ModalContainer";
import {
  AvatarDropdown,
  ChatUserDropdown,
  NotificationDropdown,
} from "../components/dropdowns";
import { DarkModeIconSwitch } from "../components/Theme";
import { ChatContainer } from "../components/popups";

import { WelcomeLoading } from "../components/loading/WelcomeLoading";
import DrawerContainer from "../components/DrawerContainer";

import { useAuth } from "../hooks/useAuth";
import { SidebarSkeleton } from "../components/RoleBasedGuard";

export default function DashboardLayout() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current || !contentRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollRef.current,
      content: contentRef.current,
      autoRaf: true,
      duration: 1.2,
      smoothWheel: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative bg-[#050505] font-sans text-gray-800 transition-colors duration-300 dark:text-gray-100">
      <WelcomeLoading />
      <ModalContainer />
      <ToastContainer />
      <DrawerContainer />
      <ChatContainer />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex h-full flex-1 flex-col overflow-hidden">
          <Navbar />
          <div ref={scrollRef} className="flex-1 overflow-hidden">
            <div ref={contentRef}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const [placeholder, setPlaceholder] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const placeholderTexts = useMemo(
    () => [
      "Tìm collection đang index...",
      "Tôi muốn chat với AI...",
      "Tổng quan hệ hệ thống...",
    ],
    [],
  );

  useEffect(() => {
    if (placeholderTexts.length === 0) return;

    const currentText = placeholderTexts[index];
    const typingSpeed = isDeleting ? 80 : 70;
    const delayBeforeDeleting = 4000;

    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentText.length) {
        setPlaceholder((prev) => prev + currentText[charIndex]);
        setCharIndex((prev) => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setPlaceholder((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      } else if (!isDeleting && charIndex === currentText.length) {
        setTimeout(() => setIsDeleting(true), delayBeforeDeleting);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % placeholderTexts.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, index, placeholderTexts]);

  return (
    <header className="dark:border-border-dark sticky top-0 z-10 flex items-center justify-between border-b border-transparent p-4 md:p-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="group relative w-112.5 max-md:block">
          <HiSearch
            size={18}
            className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-white"
          />

          <input
            type="text"
            placeholder={placeholder}
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pr-4 pl-11 text-sm text-gray-200 backdrop-blur-md transition-all placeholder:text-gray-500 hover:bg-white/10 focus:border-white/20 focus:bg-white/10 focus:ring-2 focus:ring-white/10 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <DarkModeIconSwitch />
        <ChatUserDropdown />
        <NotificationDropdown />
        <AvatarDropdown />
      </div>
    </header>
  );
}

function Sidebar() {
  const { user, loading } = useAuth();
  const navigation = getSidebarNavigation();

  const filteredNav = navigation.filter((item) => {
    if (!item.roles) return true;
    return user ? item.roles.includes(user.role) : false;
  });

  return (
    <aside className="fixed z-20 hidden max-h-screen w-64 flex-col justify-between overflow-y-hidden border-r border-white/5 bg-[#050505] md:relative md:flex">
      <div className="flex flex-col overflow-auto [&::-webkit-scrollbar]:w-1!">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 select-none">
          <img
            src={medimateLogo}
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            alt="Logo"
          />
          <span className="text-lg font-semibold tracking-tight text-white">
            Medimate
          </span>
        </div>

        {loading ? (
          <SidebarSkeleton />
        ) : (
          <nav className="mt-4 flex-1 space-y-2 overflow-y-auto px-3 pb-6">
            {filteredNav.map((item) => (
              <div key={item.path}>
                {item.children ? (
                  <CollapsibleNavItem item={item} />
                ) : (
                  <SidebarItem
                    to={item.path}
                    icon={item.icon && <item.icon />}
                    label={item.label || ""}
                    exact={item.index}
                  />
                )}
              </div>
            ))}
          </nav>
        )}
      </div>

      {/* Bottom */}
      <div className="space-y-1 border-t border-white/5 px-3 py-4">
        <SidebarItem
          to="/dashboard/settings"
          icon={<FiSettings />}
          label="Cài đặt"
        />
        <SidebarItem
          to="/dashboard/help"
          icon={<HiOutlineQuestionMarkCircle />}
          label="Trợ giúp"
        />
      </div>
    </aside>
  );
}

function CollapsibleNavItem({ item }: { item: RouteConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;

  return (
    <div className="">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="text-lg" />}
          {item.label}
        </div>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <HiChevronDown className="text-lg" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -4 }}
              animate={{ y: 0 }}
              exit={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="mt-2 ml-6 space-y-1"
            >
              {item.children?.map((child) => (
                <SubItem
                  key={child.path}
                  to={child.path}
                  label={child.label || ""}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type SidebarItemProps = {
  icon?: React.ReactNode;
  label: string;
  to: string;
  exact?: boolean;
};

export function SidebarItem({
  icon,
  label,
  to,
  exact = false,
}: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
          isActive
            ? "bg-white/10 text-white shadow-inner"
            : "text-gray-400 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      {label}
    </NavLink>
  );
}

type SubItemProps = {
  label: string;
  to: string;
};

export function SubItem({ label, to }: SubItemProps) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2 text-xs font-medium transition-all ${
          isActive
            ? "bg-white/10 text-white"
            : "text-gray-400 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
