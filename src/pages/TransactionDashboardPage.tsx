import { IoIosInformationCircleOutline } from "react-icons/io";
import { Badge } from "../components/custom-ui/Badge";
import Breadcrumb from "../components/custom-ui/Breadcrumb";
import { HiOutlineCreditCard, HiOutlinePrinter } from "react-icons/hi";
import { formatPrice } from "../common/format";
import IconAction from "../components/custom-ui/IconAction";
import { openTransactionModalAtom } from "../stores/modalStore";
import { useAtom, useSetAtom } from "jotai";
import { useMemo, useState } from "react";
import { openDrawerAtom, transactionDetailIdAtom } from "../stores/drawerStore";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import {
  useTransactionList,
  useUserTransactionList,
} from "@/hooks/data/useTransactionHooks";
import type { PaginationParams } from "@/common/query.params";
import type { Transaction } from "@/types/Transaction";
import { useAuth } from "@/hooks/useAuth";

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
  data: Transaction[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
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
export default function TransactionDashboardPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === "Doctor";
  const userId = user?.userId ?? "";

  const [pagination, setPagination] = useState<PaginationParams>({
    pageNumber: 1,
    pageSize: 10,
  });

  const allTransactionsQuery = useTransactionList(pagination, {
    enabled: !isDoctor,
  });

  const userTransactionsQuery = useUserTransactionList(userId, pagination, {
    enabled: isDoctor && !!userId,
  });

  const { data, isLoading, error, isError, refetch } = isDoctor
    ? userTransactionsQuery
    : allTransactionsQuery;

  const total = data?.totalCount ?? 0;
  const page = data?.pageNumber ?? pagination.pageNumber ?? 1;
  const pageSize = data?.pageSize ?? pagination.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const tableData = useMemo(() => data?.items ?? [], [data?.items]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;

    setPagination((prev) => ({
      ...prev,
      pageNumber: nextPage,
    }));
  };

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Quản lý giao dịch
          </h1>
        </div>
      </div>
      {/* Content */}
      <div className="my-8">
        <TransactionTable
          data={tableData}
          isLoading={isLoading}
          isError={isError}
          errorMessage={
            error?.message ||
            "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."
          }
          onRetry={() => refetch()}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

function TransactionTable({
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  page,
  pageSize,
  total,
  onPageChange,
}: Omit<TransactionTableProps, "onPageSizeChange">) {
  const [, openPaymentModal] = useAtom(openTransactionModalAtom);
  const openDrawer = useSetAtom(openDrawerAtom);
  const setTransactionDetailId = useSetAtom(transactionDetailIdAtom);

  const handleOpenDetailModal = (row: Transaction) => {
    setTransactionDetailId(row.transactionId);
    openDrawer("transaction_details");
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
      isLoading={isLoading}
      isError={isError}
      isEmpty={data.length === 0}
      errorMessage={errorMessage}
      emptyMessage="Không tìm thấy giao dịch nào trong hệ thống."
      onRetry={onRetry}
      pagination={{
        page,
        pageSize,
        total,
        onPageChange,
      }}
    >
      {data.map((row, i) => {
        const rowType: "in" | "out" = row.transactionType.toLowerCase() as
          | "in"
          | "out";
        const rowStatus = normalizeTransactionStatus(row.status);

        return (
          <tr
            key={`${row.transactionId}-${i}`}
            className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
          >
            {/* ID */}
            <td className="dark:border-border-dark border-r border-gray-400 p-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {row.transactionCode || row.transactionId || "N/A"}
              </span>
            </td>

            {/* Created At */}
            <td className="dark:border-border-dark border-r border-gray-400 p-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {formatTransactionDate(row.transactionDate)}
              </span>
            </td>

            {/* Transaction Type */}
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-center">
              <TransactionTypeBadge transaction_type={rowType} />
            </td>

            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-center">
              <span className="font-mono text-sm text-gray-600 uppercase dark:text-gray-300">
                {formatPrice(row.totalAmount ?? 0)}
              </span>
            </td>

            {/* Status */}
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-center">
              <StatusBadge status={rowStatus} />
            </td>

            {/* Actions */}
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-center">
              {rowType === "out" && rowStatus === "pending" ? (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => openPaymentModal(demoPaymentData)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-400 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition-all duration-200 hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
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
                      icon={
                        <IoIosInformationCircleOutline className="text-gray-600 dark:text-gray-300" />
                      }
                      onClick={() => handleOpenDetailModal(row)}
                    />
                  </Tooltip>
                </div>
              )}
            </td>
          </tr>
        );
      })}
    </DataTableShell>
  );
}

function formatTransactionDate(value?: string) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN");
}

function normalizeTransactionStatus(
  status?: string,
): "pending" | "paid" | "cancelled" {
  const normalizedStatus = (status || "").trim().toLowerCase();

  if (
    normalizedStatus === "paid" ||
    normalizedStatus === "success" ||
    normalizedStatus === "completed"
  ) {
    return "paid";
  }

  if (
    normalizedStatus === "cancelled" ||
    normalizedStatus === "canceled" ||
    normalizedStatus === "failed" ||
    normalizedStatus === "rejected"
  ) {
    return "cancelled";
  }

  return "pending";
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
  transaction_type: "in" | "out";
}) {
  const map = {
    in: <Badge type="success" value="Tiền nhận vào" />,
    out: <Badge type="warning" value="Tiền chi ra" />,
  };

  return map[transaction_type];
}
