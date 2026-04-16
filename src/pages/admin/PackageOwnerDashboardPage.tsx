import { useState } from "react";
import { IoLockClosedOutline, IoLockOpenOutline } from "react-icons/io5";
import { HiOutlineX } from "react-icons/hi";
import { useAtom } from "jotai";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import {
  openCancelModalAtom,
  openLockModalAtom,
  openUnlockModalAtom,
} from "@/stores/modalStore";
import { Badge } from "@/components/custom-ui/Badge";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import IconAction from "@/components/custom-ui/IconAction";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import { useFamilySubscriptions } from "@/hooks/data/useFamilySubscriptionHooks";
import type {
  FamilySubscription,
  FamilySubscriptionStatus,
} from "@/apis/family-subscription.service";

type ColumnKey =
  | "info"
  | "createdAt"
  | "expiredAt"
  | "packageInfo"
  | "status"
  | "actions";

type TableColumn = {
  key: ColumnKey;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
};

const columns: TableColumn[] = [
  {
    key: "info",
    label: "Chủ sở hữu",
    width: "w-[25%]",
  },
  {
    key: "createdAt",
    label: "Ngày đăng ký",
    width: "w-[15%]",
  },
  {
    key: "expiredAt",
    label: "Hạn thanh toán",
    width: "w-[15%]",
  },
  {
    key: "packageInfo",
    label: "Gói",
    width: "w-[15%]",
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
    label: "Danh sách hội viên",
    path: "/dashboard/packages/owner",
  },
  {
    label: "Tất cả",
  },
];

export default function PackageOwnerDashboardPage() {
  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Quản lý hội viên
          </h1>
        </div>
      </div>
      {/* Content */}
      <div className="my-8">
        <PackageOwnerTable />
      </div>
    </div>
  );
}

function PackageOwnerTable() {
  const [, openLockModal] = useAtom(openLockModalAtom);
  const [, openUnlockModal] = useAtom(openUnlockModalAtom);
  const [, openCancelModal] = useAtom(openCancelModalAtom);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data, isLoading, isError, error, refetch } = useFamilySubscriptions({
    pageNumber: page,
    pageSize,
  });

  const rows = data?.data?.items ?? [];
  const total = data?.data?.totalCount ?? rows.length;

  return (
    <DataTableShell
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      loadingMessage="Đang tải danh sách hội viên..."
      emptyTitle="Chưa có dữ liệu"
      emptyMessage="Không tìm thấy hội viên nào trong hệ thống."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: (next) => {
          setPageSize(next);
          setPage(1);
        },
      }}
    >
      {rows.map((row: FamilySubscription) => {
        // Mapping Trạng thái Suspended -> Blocked (khoá tạm), Expired -> Quá hạn...
        // tuỳ theo định nghĩa logic. Ở đây hiển thị dựa trên status API trả về.
        return (
          <tr
            key={row.subscriptionId}
            className="transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
          >
            {/* Info */}
            <td className="dark:border-border-dark border-r border-gray-400 p-4">
              <div className="flex items-center gap-3">
                <OwnerAvatar
                  url={row.familyAvatarUrl}
                  name={row.userName || "?"}
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {row.userName}
                  </span>
                  <span className="text-primary/80 dark:text-primary/90 truncate text-[12px] font-semibold italic">
                    {row.userEmail}
                  </span>
                </div>
              </div>
            </td>

            {/* Created at / Start Date */}
            <td className="dark:border-border-dark border-r border-gray-400 p-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {row.startDate
                  ? new Date(row.startDate).toLocaleDateString("vi-VN")
                  : "—"}
              </span>
            </td>

            {/* Expired At */}
            <td className="dark:border-border-dark border-r border-gray-400 p-4">
              <span
                className={`text-sm ${
                  new Date(row.endDate) < new Date()
                    ? "text-red-500"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {row.endDate
                  ? new Date(row.endDate).toLocaleDateString("vi-VN")
                  : "—"}
              </span>
            </td>

            {/* Package Type */}
            <td className="dark:border-border-dark border-r border-gray-400 p-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {row.packageName}{" "}
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    (
                    {row.price === 0
                      ? "Miễn phí"
                      : `${row.price.toLocaleString()} VND`}
                    )
                  </span>
                </span>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Gia đình:{" "}
                  <span className="font-semibold text-gray-600 dark:text-gray-300">
                    {row.familyName}
                  </span>
                </span>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  OCR:{" "}
                  <span className="text-primary/80 dark:text-primary/90 font-semibold">
                    {row.remainingOcrCount}
                  </span>{" "}
                  | Tư vấn:{" "}
                  <span className="text-primary/80 dark:text-primary/90 font-semibold">
                    {row.remainingConsultantCount}
                  </span>
                </span>
              </div>
            </td>

            {/* Status */}
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-center">
              <StatusBadge status={row.status} />
            </td>

            {/* Actions */}
            <td className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                {row.status?.toLowerCase() === "active" && (
                  <>
                    <Tooltip content="Khoá tạm thời">
                      <IconAction
                        onClick={() =>
                          openLockModal("owner_package", row.userEmail)
                        }
                        danger
                        icon={<IoLockClosedOutline />}
                      />
                    </Tooltip>

                    <Tooltip content="Huỷ gói">
                      <IconAction
                        onClick={() => openCancelModal("owner_package")}
                        danger
                        icon={<HiOutlineX />}
                      />
                    </Tooltip>
                  </>
                )}

                {row.status?.toLowerCase() === "suspended" && (
                  <>
                    <Tooltip content="Mở khoá">
                      <IconAction
                        onClick={() =>
                          openUnlockModal("owner_package", row.userEmail)
                        }
                        icon={<IoLockOpenOutline />}
                      />
                    </Tooltip>

                    <Tooltip content="Huỷ gói">
                      <IconAction
                        onClick={() => openCancelModal("owner_package")}
                        danger
                        icon={<HiOutlineX />}
                      />
                    </Tooltip>
                  </>
                )}

                {row.status?.toLowerCase() === "expired" && (
                  <>
                    <Tooltip content="Huỷ gói">
                      <IconAction
                        onClick={() => openCancelModal("owner_package")}
                        danger
                        icon={<HiOutlineX />}
                      />
                    </Tooltip>
                  </>
                )}
                {row.status?.toLowerCase() === "pending" && (
                  <>
                    <Tooltip content="Huỷ gói">
                      <IconAction
                        onClick={() => openCancelModal("owner_package")}
                        danger
                        icon={<HiOutlineX />}
                      />
                    </Tooltip>
                  </>
                )}
              </div>
            </td>
          </tr>
        );
      })}
    </DataTableShell>
  );
}

function StatusBadge({
  status,
}: {
  status: FamilySubscriptionStatus | string;
}) {
  const normalizedStatus = (status || "").toLowerCase();

  const map: Record<string, React.ReactNode> = {
    pending: <Badge type="info" value="Chưa kích hoạt" />,
    active: <Badge type="success" value="Đã kích hoạt" />,
    expired: <Badge type="warning" value="Quá hạn" />,
    cancelled: <Badge type="error" value="Đã huỷ" />,
    suspended: <Badge type="error" value="Khoá tạm thời" />,
    inactive: <Badge type="info" value="Chưa kích hoạt" />,
  };

  return (
    map[normalizedStatus] || <Badge type="info" value={status || "Unknown"} />
  );
}

function OwnerAvatar({ name, url }: { name: string; url?: string | null }) {
  return (
    <div className="relative h-10 w-10 shrink-0">
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-gray-100 to-gray-200 text-sm font-bold text-gray-700 dark:from-white/20 dark:to-white/5 dark:text-white">
        {url ? (
          <img src={url} alt={name} className="h-full w-full object-cover" />
        ) : name ? (
          name.charAt(0).toUpperCase()
        ) : (
          "?"
        )}
      </div>
    </div>
  );
}
