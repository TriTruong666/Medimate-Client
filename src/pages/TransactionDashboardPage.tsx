import { IoIosInformationCircleOutline } from "react-icons/io";
import { Badge } from "../components/Badge";
import Breadcrumb from "../components/Breadcrumb";
import { HiOutlineCreditCard, HiOutlinePrinter } from "react-icons/hi";
import { Pagination } from "../components/Pagination";
import { formatPrice } from "../utils/format";
import IconAction from "../components/IconAction";
import { Tooltip } from "../components/Tooltip";

type TransactionRow = {
  id: string;
  createdAt: string;
  transaction_type: "revenue" | "expenses";
  totalPrice: number;
  status: "pending" | "paid" | "cancelled";
};

type ColumnKey =
  | "id"
  | "createdAt"
  | "transaction_type"
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
    width: "w-[20%]",
  },
  {
    key: "createdAt",
    label: "Ngày giao dịch",
    width: "w-[20%]",
  },
  {
    key: "transaction_type",
    label: "Loại giao dịch",
    width: "w-[15%]",
    align: "center",
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
    align: "center",
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
    createdAt: "12/08/2026",
    transaction_type: "revenue",
    status: "pending",
    totalPrice: 259000,
  },
  {
    id: "PKG0002",
    transaction_type: "revenue",
    createdAt: "12/08/2026",
    status: "paid",
    totalPrice: 259000,
  },
  {
    id: "PKG0003",
    transaction_type: "revenue",
    createdAt: "12/08/2026",
    status: "cancelled",
    totalPrice: 259000,
  },
  {
    id: "PKG0004",
    transaction_type: "revenue",
    createdAt: "12/08/2026",
    status: "pending",
    totalPrice: 100000,
  },
  {
    id: "PKG0005",
    transaction_type: "revenue",
    createdAt: "12/08/2026",
    status: "cancelled",
    totalPrice: 259000,
  },
  {
    id: "PKG0006",
    transaction_type: "revenue",
    createdAt: "12/08/2026",
    status: "pending",
    totalPrice: 2259000,
  },
  {
    id: "EPX0001",
    transaction_type: "expenses",
    createdAt: "12/08/2026",
    status: "paid",
    totalPrice: 1259000,
  },
  {
    id: "EPX0002",
    transaction_type: "expenses",
    createdAt: "12/08/2026",
    status: "pending",
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

            {/* Transaction Type */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
              <TransactionTypeBadge transaction_type={row.transaction_type} />
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
              {row.transaction_type === "expenses" &&
              row.status === "pending" ? (
                <div className="flex items-center justify-center gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-all duration-200 hover:border-white/20 hover:bg-white/10 active:scale-95">
                    <HiOutlineCreditCard size={14} />
                    Thanh toán
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Tooltip content="In hoá đơn">
                    <IconAction icon={<HiOutlinePrinter />} />
                  </Tooltip>
                  <Tooltip content="Chi tiết">
                    <IconAction icon={<IoIosInformationCircleOutline />} />
                  </Tooltip>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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

function TransactionTypeBadge({
  transaction_type,
}: {
  transaction_type: "revenue" | "expenses";
}) {
  const map = {
    revenue: <Badge type="success" value="Tiền nhận vào" />,
    expenses: <Badge type="warning" value="Tiền chi ra" />,
  };

  return map[transaction_type];
}
