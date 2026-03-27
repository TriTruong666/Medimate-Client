import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { DataTableShell, type DataTableColumn } from "@/components/custom-ui/DataTableShell";
import { PATHS } from "@/config/paths";
import {
  useApproveDoctorAvailabilityException,
  useDoctorAvailabilityExceptionsPaged,
} from "@/hooks/data/useDoctorAvailabilityExceptionHooks";
import type { DoctorAvailabilityException } from "@/types/DoctorAvailabilityException";
import { useMemo, useState } from "react";
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

function getNowISOString(): string {
  return new Date().toISOString();
}

export default function DoctorExceptionApprovePage() {
  const { pathname } = useLocation();
  const activeView = getActiveView(pathname);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const nowIso = getNowISOString();

  const queryParams = useMemo(() => {
    const base = {
      isDescending: true,
      pageNumber: page,
      pageSize,
    };

    if (activeView === "approved") {
      return {
        ...base,
        isAvailableOverride: true,
      };
    }

    if (activeView === "past-unapproved") {
      return {
        ...base,
        isAvailableOverride: false,
        dateTo: nowIso,
      };
    }

    return {
      ...base,
      isAvailableOverride: false,
      dateFrom: nowIso,
    };
  }, [activeView, nowIso, page, pageSize]);

  const { data, isLoading, isError, error, refetch } =
    useDoctorAvailabilityExceptionsPaged(queryParams);

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
    if (!item.exceptionId) {
      return;
    }

    try {
      await approveMutation.mutateAsync({
        id: item.exceptionId,
        data: {
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
          reason: item.reason,
          isAvailableOverride: true,
        },
      });
      await refetch();
    } catch {
      // Toast is handled in mutation hook.
    }
  }

  return (
    <div className="page-layout">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
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
          tbodyClassName="dark:divide-border-dark divide-y divide-gray-100 bg-white/50 dark:bg-transparent"
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
              className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
            >
              <td className="dark:border-border-dark border-r border-gray-100 p-4 text-sm text-gray-900 dark:text-white">
                {item.doctorName}
              </td>
              <td className="dark:border-border-dark border-r border-gray-100 p-4 text-sm text-gray-800 dark:text-gray-200">
                {formatDateLabel(item.date)}
              </td>
              <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center text-sm text-gray-800 dark:text-gray-200">
                {toTimeLabel(item.startTime)} - {toTimeLabel(item.endTime)}
              </td>
              <td className="dark:border-border-dark border-r border-gray-100 p-4 text-sm text-gray-700 dark:text-gray-300">
                {item.reason || "Không có lý do"}
              </td>
              <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
                {item.isAvailableOverride ? (
                  <Badge type="success" value="Đã duyệt" />
                ) : (
                  <Badge type="warning" value="Chưa duyệt" />
                )}
              </td>
              <td className="p-4 text-center">
                {activeView === "pending" ? (
                  <button
                    type="button"
                    onClick={() => void handleApprove(item)}
                    disabled={approveMutation.isPending}
                    className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Duyệt
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </DataTableShell>
      </div>
    </div>
  );
}
