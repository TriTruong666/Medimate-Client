import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { DataTableShell, type DataTableColumn } from "@/components/custom-ui/DataTableShell";
import { PATHS } from "@/config/paths";
import {
  useApproveDoctorAvailabilityException,
  useDoctorAvailabilityExceptionsPaged,
} from "@/hooks/data/useDoctorAvailabilityExceptionHooks";
import type { DoctorAvailabilityException } from "@/types/DoctorAvailabilityException";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const columns: DataTableColumn[] = [
  { key: "doctor", label: "Bác sĩ", width: "w-[20%]" },
  { key: "date", label: "Ngày nghỉ", width: "w-[18%]" },
  { key: "time", label: "Khung giờ", width: "w-[14%]", align: "center" },
  { key: "reason", label: "Lý do", width: "w-[28%]" },
  { key: "status", label: "Trạng thái", width: "w-[10%]", align: "center" },
  { key: "actions", label: "Thao tác", width: "w-[10%]", align: "center" },
];

type ExceptionView = "pending" | "past-unapproved" | "approved";

function getActiveView(pathname: string): ExceptionView {
  if (pathname === PATHS.DASHBOARD.APPROVE_EXCEPTION.APPROVED) {
    return "approved";
  }

  if (pathname === PATHS.DASHBOARD.APPROVE_EXCEPTION.PAST_UNAPPROVED) {
    return "past-unapproved";
  }

  return "pending";
}

function getPageTitle(view: ExceptionView): string {
  if (view === "approved") {
    return "Lịch nghỉ đã duyệt";
  }

  if (view === "past-unapproved") {
    return "Lịch nghỉ không duyệt";
  }

  return "Lịch nghỉ chờ duyệt";
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}

function toTimeLabel(value: string): string {
  return value.slice(0, 5);
}



export default function DoctorExceptionApprovePage() {
  const { pathname } = useLocation();
  const activeView = getActiveView(pathname);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Map activeView -> status string cho API
  const statusFilter =
    activeView === "approved" ? "Approved"
      : activeView === "past-unapproved" ? "Rejected"
        : "Pending";

  const queryParams = {
    isDescending: true,
    pageNumber: page,
    pageSize,
    status: statusFilter,
  };

  const { data, isLoading, isError, error, refetch } = useDoctorAvailabilityExceptionsPaged(queryParams);
  const approveMutation = useApproveDoctorAvailabilityException();

  const rows = (data?.items ?? []) as DoctorAvailabilityException[];
  const total = data?.totalCount ?? 0;

  const breadcrumbItems = [
    { label: "Dashboard", path: PATHS.DASHBOARD.ROOT },
    {
      label: "Duyệt lịch nghỉ",
      path: PATHS.DASHBOARD.APPROVE_EXCEPTION.ROOT,
    },
    { label: getPageTitle(activeView) },
  ];

  async function handleApprove(item: DoctorAvailabilityException) {
    if (!item.exceptionId) return;

    try {
      await approveMutation.mutateAsync({
        id: item.exceptionId,
        data: {
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
          reason: item.reason,
          isAvailableOverride: item.isAvailableOverride, // GIỮ NGUYÊN (thường là false đối với lịch nghỉ)
          status: "Approved", // CHỈ THAY ĐỔI TRẠNG THÁI
        },
      });
      await refetch();
    } catch { }
  }

  async function handleReject(item: DoctorAvailabilityException) {
    if (!item.exceptionId) return;

    try {
      await approveMutation.mutateAsync({
        id: item.exceptionId,
        data: {
          ...item,
          status: "Rejected", // Cập nhật trạng thái thành Từ chối
        },
      });
      await refetch();
    } catch { }
  }

  return (
    <div className="page-layout">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            {getPageTitle(activeView)}
          </h1>
        </div>
      </div>

      <div className="my-8">
        <DataTableShell
          columns={columns}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          onRetry={() => void refetch()}
          isEmpty={!isLoading && !isError && rows.length === 0}
          loadingMessage="Đang tải danh sách lịch nghỉ..."
          emptyTitle="Chưa có dữ liệu"
          emptyMessage="Không tìm thấy lịch nghỉ theo bộ lọc hiện tại."
          tbodyClassName="dark:divide-border-dark divide-y divide-gray-400 bg-white/50 dark:bg-transparent"
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
            onPageSizeChange: (nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(1);
            },
          }}
        >
          {rows.map((item, index) => (
            <tr
              key={item.exceptionId || `${item.doctorId}-${item.date}-${index}`}
              className="transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <td className="border-r border-gray-400 p-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-medium shadow-sm dark:bg-white/10 dark:text-white">
                    {(item.doctorName || "B").charAt(0)}
                  </div>
                  <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {item.doctorName}
                  </span>
                </div>
              </td>
              <td className="border-r border-gray-400 p-4 text-sm font-medium text-gray-700 dark:border-white/10 dark:text-gray-200">
                {formatDateLabel(item.date)}
              </td>
              <td className="border-r border-gray-400 p-4 text-center text-sm font-medium text-gray-700 dark:border-white/10 dark:text-gray-200">
                {toTimeLabel(item.startTime)} - {toTimeLabel(item.endTime)}
              </td>
              <td className="border-r border-gray-400 p-4 text-sm font-medium text-gray-600 dark:border-white/10 dark:text-gray-300">
                {item.reason || "Không có lý do"}
              </td>
              <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                {item.status?.toLowerCase() === "approved" ? (
                  <Badge type="success" value="Đã duyệt" />
                ) : item.status?.toLowerCase() === "rejected" ? (
                  <Badge type="error" value="Không duyệt" />
                ) : (
                  <Badge type="warning" value="Chờ duyệt" />
                )}
              </td>
              <td className="p-4 text-center">
                {activeView === "pending" ? (
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleApprove(item)}
                      disabled={approveMutation.isPending}
                      className="rounded-lg bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-600 shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30"
                    >
                      Duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReject(item)}
                      disabled={approveMutation.isPending}
                      className="rounded-lg bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30"
                    >
                      Từ chối
                    </button>
                  </div>
                ) : (
                  <span className="text-xs italic text-gray-400">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </DataTableShell>
      </div>
    </div>
  );
}
