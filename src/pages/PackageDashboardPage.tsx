import { IoAdd } from "react-icons/io5";
import Breadcrumb from "../components/Breadcrumb";
import { FiMoreVertical, FiUsers } from "react-icons/fi";
import { formatPrice } from "../utils/format";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { useClickOutside } from "../hooks/useDropdown";
type PackageType = {
  name: string;
  price: number;
  users: number;
  status?: "active" | "inactive";
  updated?: string;
};
type DropdownItemProps = {
  label: string;
  danger?: boolean;
};

const breadcrumbItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Gói",
    path: "/dashboard/packages",
  },
  {
    label: "Quản lý gói",
  },
];

const packages = [
  {
    name: "Basic",
    price: 199000,
    users: 124,
    gradient: "from-slate-600 to-slate-800",
  },
  {
    name: "Medimate",
    price: 399000,
    users: 482,
    gradient: "from-cyan-500 via-blue-600 to-indigo-700",
    highlight: true,
  },
  {
    name: "Premium",
    price: 899000,
    users: 73,
    gradient: "from-purple-600 via-pink-600 to-rose-600",
  },
];
export function PackageDashboardPage() {
  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Quản lý gói
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <a href="/dashboard/packages/new" className="btn-primary">
            <IoAdd />
            Thêm gói mới
          </a>
        </div>
      </div>
      {/* Content */}
      <div className="my-8 space-y-8">
        <PackageGrid />
      </div>
    </div>
  );
}

function PackageGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {packages.map((pkg) => (
        <PackageCard key={pkg.name} pkg={pkg} />
      ))}
    </div>
  );
}

function PackageCard({ pkg }: { pkg: PackageType }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));
  return (
    <motion.div
      ref={ref}
      className="group hover:border-primary dark:hover:bg-primary/10 relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-300 dark:border-white/10 dark:bg-white/5"
    >
      {/* Top */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {pkg.name}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Cập nhật gần đây
            </p>
          </div>
        </div>

        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <FiMoreVertical />
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
                <DropdownItem label="Sửa gói" />

                <div className="h-px bg-white/10" />
                <DropdownItem label="Xoá gói" danger />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-gray-100 dark:bg-white/10" />

      {/* Content */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatPrice(pkg.price)}
            <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
              / tháng
            </span>
          </p>

          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <FiUsers />
            <span>{pkg.users} người dùng</span>
          </div>
        </div>

        <StatusBadge status={pkg.status ?? "active"} />
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: "active" | "inactive" }) {
  const active = status === "active";

  return (
    <span
      className={`rounded-lg px-2 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"
      }`}
    >
      {active ? "Đang hoạt động" : "Tạm ngưng"}
    </span>
  );
}

function DropdownItem({ label, danger = false }: DropdownItemProps) {
  return (
    <button
      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-gray-300 hover:bg-white/5 hover:text-white"
      } `}
    >
      {label}
    </button>
  );
}
