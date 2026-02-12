import { IoIosInformationCircleOutline } from "react-icons/io";
import { TbCancel } from "react-icons/tb";
import { Badge } from "../components/Badge";
import Breadcrumb from "../components/Breadcrumb";
import { HiOutlinePrinter } from "react-icons/hi";
import { Pagination } from "../components/Pagination";
import { formatPrice } from "../utils/format";

type TransactionRow = {
  id: string;
  expiredAt: string;
  createdAt: string;
  totalPrice: number;
  status: "pending" | "paid" | "cancelled";
};

type ColumnKey =
  | "id"
  | "createdAt"
  | "expiredAt"
  | "totalPrice"
  | "status"
  | "actions";

type TableColumn = {
  key: ColumnKey;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
};

type TransactionTableProps = {
  data: TransactionRow[];
};

const breadcrumbItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Giao dịch",
    path: "/dashboard/transaction",
  },
  {
    label: "Tất cả",
  },
];

const columns: TableColumn[] = [
  {
    key: "id",
    label: "Số giao dịch",
    width: "w-[15%]",
  },
  {
    key: "createdAt",
    label: "Ngày giao dịch",
    width: "w-[20%]",
  },
  {
    key: "expiredAt",
    label: "Hạn thanh toán",
    width: "w-[20%]",
  },
  {
    key: "totalPrice",
    label: "Tổng tiền",
    width: "w-[15%]",
    align: "center",
  },
  {
    key: "status",
    label: "Trạng thái",
    width: "w-[15%]",
    align: "left",
  },
  {
    key: "actions",
    label: "Thao tác",
    width: "w-[15%]",
    align: "center",
  },
];
const demoData: TransactionRow[] = [
  {
    id: "PKG0001",
    createdAt: "10 tiếng trước",
    expiredAt: "12/08/2026",
    status: "pending",
    totalPrice: 259000,
  },
  {
    id: "PKG0002",
    createdAt: "10 tiếng trước",
    expiredAt: "12/08/2026",
    status: "paid",
    totalPrice: 259000,
  },
  {
    id: "PKG0003",
    createdAt: "10 tiếng trước",
    expiredAt: "12/08/2026",
    status: "cancelled",
    totalPrice: 259000,
  },
  {
    id: "PKG0004",
    createdAt: "10 tiếng trước",
    expiredAt: "12/08/2026",
    status: "pending",
    totalPrice: 100000,
  },
  {
    id: "PKG0005",
    createdAt: "10 tiếng trước",
    expiredAt: "12/08/2026",
    status: "cancelled",
    totalPrice: 259000,
  },
  {
    id: "PKG0006",
    createdAt: "10 tiếng trước",
    expiredAt: "12/08/2026",
    status: "pending",
    totalPrice: 2259000,
  },
  {
    id: "PKG0007",
    createdAt: "10 tiếng trước",
    expiredAt: "12/08/2026",
    status: "paid",
    totalPrice: 1259000,
  },
];
export default function TransactionDashboardPage() {
  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Quản lý giao dịch
          </h1>
        </div>
      </div>
      {/* Content */}
      <div className="my-8">
        <TransactionTable data={demoData} />
        <Pagination page={1} pageSize={20} total={demoData.length} />
      </div>
    </div>
  );
}

function TransactionTable({ data }: TransactionTableProps) {
  return (
    <table className="dark:border-border-dark w-full min-w-225 table-fixed border-collapse border-x border-t border-gray-100 text-left">
      <thead>
        <tr className="dark:bg-border-dark/30 bg-gray-50/50">
          {columns.map((col, i) => (
            <th
              key={col.key}
              className={`border-b p-4 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400 ${col.width ?? ""} ${col.align === "center" ? "text-center!" : ""} ${col.align === "right" ? "text-right!" : "text-left"} ${
                i < columns.length - 1
                  ? "dark:border-border-dark border-r border-gray-100"
                  : ""
              } `}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody className="dark:divide-border-dark divide-y divide-gray-100">
        {data.map((row, i) => (
          <tr
            key={i}
            className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
          >
            {/* ID */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {row.id}
              </span>
            </td>

            {/* Created At */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {row.createdAt}
              </span>
            </td>

            {/* Expired At */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <span className="text-sm text-gray-600 uppercase dark:text-gray-300">
                {row.expiredAt}
              </span>
            </td>

            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
              <span className="font-mono text-sm text-gray-600 uppercase dark:text-gray-300">
                {formatPrice(row.totalPrice)}
              </span>
            </td>

            {/* Status */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
              <StatusBadge status={row.status} />
            </td>

            {/* Actions */}
            <td className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <IconAction icon={<HiOutlinePrinter />} />
                <IconAction icon={<IoIosInformationCircleOutline />} />
                {row.status === "pending" && (
                  <IconAction icon={<TbCancel />} danger />
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IconAction({
  icon,
  danger = false,
  className = "",
}: {
  icon: React.ReactNode;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${
        danger
          ? "hover:text-red-500 dark:hover:text-red-400"
          : "hover:text-primary dark:hover:text-white"
      } ${className}`}
    >
      {icon}
    </button>
  );
}

function StatusBadge({ status }: { status: "pending" | "paid" | "cancelled" }) {
  const map = {
    pending: <Badge type="warning" value="Chưa thanh toán" />,
    paid: <Badge type="success" value="Đã thanh toán" />,
    cancelled: <Badge type="error" value="Bị huỷ" />,
  };

  return map[status];
}
