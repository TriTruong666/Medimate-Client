/* eslint-disable @typescript-eslint/no-explicit-any */
import { FiMoreVertical, FiUsers } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { HiCheck } from "react-icons/hi";
import { HiXMark } from "react-icons/hi2";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { useClickOutside } from "@/hooks/useDropdown";
import { formatPrice } from "@/common/format";

type TableColumn = {
  key: ColumnKey;
  label: string;
};

type ColumnKey = string;

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

const columns: TableColumn[] = [
  {
    key: "basic",
    label: "Basic",
  },
  {
    key: "medimate",
    label: "Medimate",
  },
  {
    key: "premium",
    label: "Premium",
  },
];

type ComparisionRow = {
  max_person: number | "unlimited"; // số lượng người có thể quản lý
  sms_notification: boolean; // nhắc sms nếu quá hạn uống thuốc cho người quản lý
  health_index: "non_auto" | "auto"; // nhập tay chỉ số sức khoẻ hoặc tự động đồng bộ từ các app Apple Health/Google Fit
  storage_health_document: number | "unlimited"; // số lượng file bệnh án được lưu trữ
  export_to_doctor: boolean; // Xuất báo cáo sức khỏe (PDF) để gửi bác sĩ
  ocr: boolean;
  chatbot: boolean; // AI Chatbot tư vấn sức khỏe cơ bản
  drug_interaction: boolean; // tương tác thuốc
  chat_to_doctor: boolean;
  advertisement: boolean; // quảng cáo
  find_hospital: boolean;
  anomaly_detection: boolean; // dự báo bất thường của AI
};

const demoData: ComparisionRow[] = [
  {
    max_person: 5,
    sms_notification: false,
    health_index: "non_auto",
    storage_health_document: 5,
    export_to_doctor: false,
    ocr: true,
    chat_to_doctor: false,
    chatbot: false,
    drug_interaction: false,
    advertisement: true,
    anomaly_detection: false,
    find_hospital: true,
  },
  {
    max_person: 30,
    sms_notification: true,
    health_index: "non_auto",
    storage_health_document: 25,
    export_to_doctor: true,
    ocr: true,
    chat_to_doctor: true,
    chatbot: true,
    drug_interaction: false,
    advertisement: false,
    anomaly_detection: false,
    find_hospital: true,
  },
  {
    max_person: "unlimited",
    sms_notification: true,
    health_index: "auto",
    storage_health_document: "unlimited",
    export_to_doctor: true,
    ocr: true,
    chat_to_doctor: true,
    chatbot: true,
    drug_interaction: true,
    advertisement: false,
    anomaly_detection: true,
    find_hospital: true,
  },
];

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
    price: 0,
    users: 1124,
    gradient: "from-slate-600 to-slate-800",
  },
  {
    name: "Medimate",
    price: 99000,
    users: 102,
    gradient: "from-cyan-500 via-blue-600 to-indigo-700",
    highlight: true,
  },
  {
    name: "Premium",
    price: 199000,
    users: 43,
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
      </div>
      {/* Content */}
      <div className="my-8 space-y-8">
        <PackageGrid />
      </div>
      <div className="my-12 space-y-8">
        <PackageComparisonTable />
      </div>
    </div>
  );
}

function PackageComparisonTable() {
  const featureRows = [
    {
      label: "Số lượng người được quản lý tối đa",
      render: (row: ComparisionRow) =>
        typeof row.max_person === "number" ? row.max_person : "Không giới hạn",
    },
    {
      label: "Thông báo SMS",
      render: (row: ComparisionRow) => row.sms_notification,
    },
    {
      label: "Chỉ số sức khỏe",
      render: (row: ComparisionRow) =>
        row.health_index === "auto" ? "Tự động đồng bộ" : "Nhập thủ công",
    },
    {
      label: "Lưu trữ hồ sơ bệnh án",
      render: (row: ComparisionRow) =>
        typeof row.storage_health_document === "number"
          ? `${row.storage_health_document} files`
          : "Không giới hạn",
    },
    {
      label: "Xuất PDF gửi bác sĩ",
      render: (row: ComparisionRow) => row.export_to_doctor,
    },
    {
      label: "Scan OCR đơn thuốc",
      render: (row: ComparisionRow) => row.ocr,
    },
    {
      label: "Chat với bác sĩ",
      render: (row: ComparisionRow) => row.chat_to_doctor,
    },
    {
      label: "Trợ lý MedimateAI",
      render: (row: ComparisionRow) => row.chatbot,
    },
    {
      label: "Tương tác thuốc",
      render: (row: ComparisionRow) => row.drug_interaction,
    },
    {
      label: "AI phân tích xu hướng sức khỏe",
      render: (row: ComparisionRow) => row.anomaly_detection,
    },
    {
      label: "Quảng cáo",
      render: (row: ComparisionRow) => row.advertisement,
    },
    {
      label: "Tìm nhà thuốc / bệnh viện gần nhất",
      render: (row: ComparisionRow) => row.find_hospital,
    },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5">
      <table className="min-w-full text-sm">
        {/* Header */}
        <thead className="bg-gray-50 dark:bg-white/10">
          <tr>
            <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">
              So sánh gói
            </th>

            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-4 text-center font-semibold text-gray-700 dark:text-white`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
          {featureRows.map((feature, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-gray-50 dark:hover:bg-white/5"
            >
              {/* Feature label */}
              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                {feature.label}
              </td>

              {/* Plans */}
              {demoData.map((pkg, colIndex) => (
                <td key={colIndex} className={`px-6 py-4 text-center`}>
                  <TableCell value={feature.render(pkg)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableCell({ value }: { value: any }) {
  if (typeof value === "boolean") {
    return value ? (
      <HiCheck className="mx-auto text-lg text-emerald-500" />
    ) : (
      <HiXMark className="mx-auto text-lg text-gray-300 dark:text-red-600" />
    );
  }

  if (value === "Không giới hạn") {
    return <span className="text-primary dark:text-primary">{value}</span>;
  }

  return <span className="text-gray-700 dark:text-gray-200">{value}</span>;
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
            {pkg.price === 0 ? "Miễn phí" : formatPrice(pkg.price)}
            {pkg.price !== 0 && (
              <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                / tháng
              </span>
            )}
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
