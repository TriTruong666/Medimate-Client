import { IoIosInformationCircleOutline } from "react-icons/io";
import { Badge } from "../components/custom-ui/Badge";
import Breadcrumb from "../components/custom-ui/Breadcrumb";
import { HiOutlineCreditCard, HiOutlinePrinter } from "react-icons/hi";
import { formatPrice } from "../common/format";
import IconAction from "../components/custom-ui/IconAction";
import { openTransactionModalAtom } from "../stores/modalStore";
import { useAtom, useSetAtom } from "jotai";
import { useMemo, useState } from "react";
import { openDrawerAtom, transactionDetailIdAtom, payoutDetailDataAtom } from "../stores/drawerStore";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import {
  useTransactionList,
  useUserTransactionList,
} from "@/hooks/data/useTransactionHooks";
import { usePayouts, useCompleteSubscriptionRefund } from "@/hooks/data/usePayoutHooks";
import type { PaginationParams } from "@/common/query.params";
import type { Transaction } from "@/types/Transaction";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/config/paths";

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
    path: PATHS.DASHBOARD.TRANSACTION.ROOT,
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

  const payoutQuery = usePayouts({
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
  });

  const { data: rawData, isLoading, error, isError, refetch } = isDoctor
    ? payoutQuery
    : allTransactionsQuery;

  const data = isDoctor ? (rawData as any)?.data : rawData;

  const total = data?.totalCount ?? 0;
  const page = data?.pageNumber ?? pagination.pageNumber ?? 1;
  const pageSize = data?.pageSize ?? pagination.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Map PayoutItemDto sang Transaction format cho bác sĩ
  const tableData = useMemo(() => {
    if (!data?.items) return [];
    if (isDoctor) {
      return data.items
        .filter((item: any) => item.status !== "Cancelled" && item.status !== "Hold") // Doctor không hiển thị Hold
        .map((item: any) => ({
          transactionId: item.payoutId,
          transactionCode: `APPOINTMENT-${item.payoutId.split('-')[0].toUpperCase()}`,
          transactionDate: item.calculatedAt,
          transactionType: "doctor_payout",
          totalAmount: item.amount,
          status: item.status === "ReadyToPay" ? "pending" : item.status,
          originalPayoutData: item,
        })) as any[];
    }
    return data.items as Transaction[];
  }, [data?.items, isDoctor]);

  const [activeTab, setActiveTab] = useState<"all" | "in" | "out">("all");

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPagination((prev) => ({ ...prev, pageNumber: nextPage }));
  };

  const tabCounts = useMemo(() => {
    const inCount = tableData.filter((t) =>
      t.transactionType?.toLowerCase().startsWith("in"),
    ).length;
    const outCount = tableData.filter((t) =>
      t.transactionType?.toLowerCase().startsWith("out"),
    ).length;
    return { all: tableData.length, in: inCount, out: outCount };
  }, [tableData]);

  const filteredData = useMemo(() => {
    if (activeTab === "all") return tableData;
    if (activeTab === "in")
      return tableData.filter((t) =>
        t.transactionType?.toLowerCase().startsWith("in"),
      );
    // out
    return tableData.filter((t) =>
      t.transactionType?.toLowerCase().startsWith("out"),
    );
  }, [tableData, activeTab]);

  const tabs: { key: "all" | "in" | "out"; label: string; color: string }[] = [
    { key: "all", label: "Tất cả", color: "text-gray-500" },
    { key: "in", label: "Thu vào", color: "text-emerald-500" },
    { key: "out", label: "Chi ra", color: "text-rose-500" },
  ];

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

      {/* Tab bar */}
      <div className="mt-6 flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-white/10 dark:bg-white/5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${activeTab === tab.key
              ? "bg-white shadow-sm text-gray-900 dark:bg-white/10 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
          >
            {tab.label}
            <span
              className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${activeTab === tab.key
                ? tab.key === "in"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : tab.key === "out"
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                    : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200"
                : "bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500"
                }`}
            >
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="my-6">
        <TransactionTable
          data={filteredData}
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
  const [openPaymentModal] = useAtom(openTransactionModalAtom);
  const openDrawer = useSetAtom(openDrawerAtom);
  const setTransactionDetailId = useSetAtom(transactionDetailIdAtom);
  const setPayoutDetailData = useSetAtom(payoutDetailDataAtom);

  const handleOpenDetailModal = (row: any) => {
    if (row.originalPayoutData) {
      setPayoutDetailData(row.originalPayoutData);
    } else {
      setTransactionDetailId(row.transactionId);
    }
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
        const rowType = row.transactionType.toLowerCase();
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

              <div className="flex items-center justify-center gap-2">
                <Tooltip content="Chi tiết">
                  <IconAction
                    icon={
                      <IoIosInformationCircleOutline className="text-gray-600 dark:text-gray-300" />
                    }
                    onClick={() => handleOpenDetailModal(row)}
                  />
                </Tooltip>
              </div>

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
  transaction_type: string;
}) {
  const map: Record<string, React.ReactElement> = {
    in_session: <Badge type="success" value="Thanh toán tư vấn" />,
    in_package: <Badge type="success" value="Thanh toán gói" />,
    out_refund_session: <Badge type="warning" value="Hoàn tiền tư vấn" />,
    out_refund_subscription: <Badge type="warning" value="Hoàn tiền gói thành viên " />,
    out_clinic_payout: <Badge type="warning" value="Thanh toán phòng khám" />,
    out: <Badge type="warning" value="Tiền chi ra" />,
  };

  return map[transaction_type] || <Badge type="info" value={transaction_type} />;
}
