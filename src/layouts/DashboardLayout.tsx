/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineFolder,
  HiOutlinePhotograph,
  HiOutlineCog,
  HiOutlineQuestionMarkCircle,
  HiChevronDown,
  HiSearch,
} from "react-icons/hi";
import { GrTransaction } from "react-icons/gr";
import { IoSync } from "react-icons/io5";
import medimateLogo from "../assets/medimate-logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { ToastContainer } from "../components/ToastContainer";
import { NavLink, Outlet } from "react-router-dom";
import ModalContainer from "../components/ModalContainer";
import {
  AvatarDropdown,
  ChatUserDropdown,
  NotificationDropdown,
} from "../components/Dropdown";
import { DarkModeIconSwitch } from "../components/Theme";
import { ChatContainer } from "../components/Popup";
import { AiOutlineRobot } from "react-icons/ai";
import { RiVipDiamondLine } from "react-icons/ri";

export default function DashboardLayout() {
  return (
    <div className="bg-[#050505] font-sans text-gray-800 transition-colors duration-300 dark:text-gray-100">
      <ModalContainer />
      <ToastContainer />
      <ChatContainer />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex h-full flex-1 flex-col overflow-hidden">
          <Navbar />
          <div className="flex-1 overflow-y-auto scroll-smooth py-4 md:py-8">
            <Outlet />
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
      "Tổng quan hệ thống...",
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
        <div className="group relative hidden w-full max-w-md md:block">
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
  const [openDocs, setOpenDocs] = useState(true);

  return (
    <aside className="fixed z-20 hidden h-full w-64 flex-col border-r border-white/5 bg-[#050505] md:relative md:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 select-none">
        <img
          src={medimateLogo}
          className="flex h-9 w-9 items-center justify-center rounded-lg"
        ></img>
        <span className="text-lg font-semibold tracking-tight text-white">
          Medimate
        </span>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-2 overflow-y-auto px-3">
        {/* Overview */}
        <SidebarItem
          to="/dashboard"
          icon={<HiOutlineViewGrid />}
          label="Tổng quan"
          exact
        />

        {/* Active */}
        <SidebarItem
          to="/dashboard/accounts"
          icon={<HiOutlineUsers />}
          label="Tài khoản"
        />
        <SidebarItem
          to="/dashboard/transaction"
          icon={<GrTransaction />}
          label="Giao dịch"
        />
        <SidebarItem
          to="/dashboard/packages"
          icon={<RiVipDiamondLine />}
          label="Hội viên"
        />

        {/* Documents */}
        <div className="">
          {/* Parent */}
          <button
            onClick={() => setOpenDocs((v: any) => !v)}
            className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <div className="flex items-center gap-3">
              <HiOutlineFolder className="text-lg" />
              Tài liệu
            </div>

            <motion.span
              animate={{ rotate: openDocs ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <HiChevronDown className="text-lg" />
            </motion.span>
          </button>

          {/* Sub menu */}
          <AnimatePresence initial={false}>
            {openDocs && (
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
                  <SubItem to="/dashboard/documents" label="Tất cả" />
                  <SubItem
                    to="/dashboard/documents/uploaded"
                    label="Vừa tải lên"
                  />
                  <SubItem to="/dashboard/documents/indexed" label="Đã nạp" />
                  <SubItem to="/dashboard/documents/failed" label="Thất bại" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <SidebarItem to="/dashboard/rag" icon={<IoSync />} label="RAG Core" />
        <SidebarItem
          to="/dashboard/chatbot"
          icon={<AiOutlineRobot />}
          label="Chatbot"
        />
        <SidebarItem
          to="/dashboard/images"
          icon={<HiOutlinePhotograph />}
          label="CDN"
        />
      </nav>

      {/* Bottom */}
      <div className="space-y-1 border-t border-white/5 px-3 py-4">
        <SidebarItem
          to="/dashboard/settings"
          icon={<HiOutlineCog />}
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

type SidebarItemProps = {
  icon: React.ReactNode;
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
