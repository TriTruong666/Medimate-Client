/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineFolder,
  HiOutlineChatAlt2,
  HiOutlinePhotograph,
  HiOutlineCog,
  HiOutlineQuestionMarkCircle,
  HiChevronDown,
  HiSearch,
} from "react-icons/hi";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
export default function DashboardLayout() {
  return (
    <div className="bg-[#0e0e11] font-sans text-gray-800 transition-colors duration-300 dark:text-gray-100">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex h-full flex-1 flex-col overflow-hidden">
          <header className="dark:border-border-dark sticky top-0 z-10 flex items-center justify-between border-b border-transparent p-4 md:p-6">
            <div className="flex flex-1 items-center gap-4">
              <div className="group relative hidden w-full max-w-md md:block">
                <HiSearch
                  size={18}
                  className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-white"
                />

                <input
                  type="text"
                  placeholder="Search documents..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pr-4 pl-11 text-sm text-gray-200 backdrop-blur-md transition-all placeholder:text-gray-500 hover:bg-white/10 focus:border-white/20 focus:bg-white/10 focus:ring-2 focus:ring-white/10 focus:outline-none"
                />
              </div>
            </div>
          </header>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const [openDocs, setOpenDocs] = useState(true);

  return (
    <aside className="fixed z-20 hidden h-full w-64 flex-col border-r border-white/5 bg-[#0e0e11] md:relative md:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <HiOutlineViewGrid className="text-xl text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">
          AdminUI
        </span>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-2 overflow-y-auto px-3">
        {/* Overview */}
        <SidebarItem icon={<HiOutlineViewGrid />} label="Tổng quan" />

        {/* Active */}
        <SidebarItem icon={<HiOutlineUsers />} label="Tài khoản" active />

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
                  <SubItem label="Upload" />
                  <SubItem label="Indexed" />
                  <SubItem label="Success" active />
                  <SubItem label="Failed" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <SidebarItem icon={<HiOutlineChatAlt2 />} label="Chatbot" />
        <SidebarItem icon={<HiOutlinePhotograph />} label="Images" />
      </nav>

      {/* Bottom */}
      <div className="space-y-1 border-t border-white/5 px-3 py-4">
        <SidebarItem icon={<HiOutlineCog />} label="Cài đặt" />
        <SidebarItem icon={<HiOutlineQuestionMarkCircle />} label="Trợ giúp" />
      </div>
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
        active
          ? "bg-white/10 text-white shadow-inner"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      } `}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </a>
  );
}

function SubItem({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href="#"
      className={`block rounded-lg px-3 py-2 text-xs font-medium transition-all ${
        active
          ? "bg-white/10 text-white"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      } `}
    >
      {label}
    </a>
  );
}
