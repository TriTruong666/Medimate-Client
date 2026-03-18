import { IoIosInformationCircleOutline } from "react-icons/io";
import { Badge } from "../components/custom-ui/Badge";
import Breadcrumb from "../components/custom-ui/Breadcrumb";
import { HiOutlineCreditCard, HiOutlinePrinter } from "react-icons/hi";
import { useMemo, useState } from "react";
import { formatPrice } from "../common/format";
import IconAction from "../components/custom-ui/IconAction";
import { openTransactionModalAtom } from "../stores/modalStore";
import { useAtom, useSetAtom } from "jotai";
import {
  openDrawerAtom,
  transactionDetailDataAtom,
} from "../stores/drawerStore";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";

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
      </div>
    </div>
  );
}

function TransactionTable({ data }: TransactionTableProps) {
  const [, openPaymentModal] = useAtom(openTransactionModalAtom);
  const openDrawer = useSetAtom(openDrawerAtom);
  const setTransactionDetailData = useSetAtom(transactionDetailDataAtom);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const handleOpenDetailModal = (row: TransactionRow) => {
    setTransactionDetailData(row);
    openDrawer("transaction_details");
  };
  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) return;
    setPage(nextPage);
  };

  const demoPaymentData = {
    doctorName: "BS. Nguyễn Minh Hoàng",
    bankName: "Vietcombank",
    bankAccount: "0123456789",
    accountName: "NGUYEN MINH HOANG",
    amount: 13750000,
    period: "02/2026",
    transferContent: "PAY-2026-02 DOC-8841",
    qrImageUrl:
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAYMENT_DEMO",
  };
  return (
    <DataTableShell
      columns={columns}
      isEmpty={data.length === 0}
      emptyMessage="Không tìm thấy giao dịch nào trong hệ thống."
      pagination={{
        page: currentPage,
        pageSize,
        total: data.length,
        onPageChange: handlePageChange,
      }}
    >
      {pagedData.map((row, i) => (
          <tr
            key={`${row.id}-${i}`}
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
                  <button
                    onClick={() => openPaymentModal(demoPaymentData)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-all duration-200 hover:border-white/20 hover:bg-white/10 active:scale-95"
                  >
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
                    <IconAction
                      icon={<IoIosInformationCircleOutline />}
                      onClick={() => handleOpenDetailModal(row)}
                    />
                  </Tooltip>
                </div>
              )}
            </td>
          </tr>
        ))}
    </DataTableShell>
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
