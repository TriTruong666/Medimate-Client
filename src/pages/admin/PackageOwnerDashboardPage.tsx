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
import { useClientPagination } from "@/hooks/useClientPagination";
type PackageOwnerRow = {
  name: string;
  email: string;
  expiredAt: string | "free";
  createdAt: string;
  packageName: string;
  duration: "monthly" | "3 months" | "6 months" | "12 months" | "yearly";
  status: "pending" | "active" | "overdue" | "cancelled" | "blocked";
};

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

type PackageOwnerTableProps = {
  data: PackageOwnerRow[];
};

const columns: TableColumn[] = [
  {
    key: "info",
    label: "Chủ sở hữu",
    width: "w-[25%]",
  },
  {
    key: "createdAt",
    label: "Ngày tạo",
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

const demoData: PackageOwnerRow[] = [
  {
    email: "tritruonghoang3@gmail.com",
    name: "Trí Trương",
    createdAt: "14/01/2026",
    expiredAt: "14/07/2026",
    duration: "6 months",
    packageName: "Medimate",
    status: "active",
  },
  {
    email: "tritruonghoang3@gmail.com",
    name: "Trí Trương",
    createdAt: "Hôm nay",
    expiredAt: "14/05/2026",
    duration: "yearly",
    packageName: "Premium",
    status: "blocked",
  },
  {
    email: "tritruonghoang3@gmail.com",
    name: "Trí Trương",
    createdAt: "Hôm nay",
    expiredAt: "14/05/2026",
    duration: "yearly",
    packageName: "Premium",
    status: "pending",
  },
  {
    email: "tritruonghoang3@gmail.com",
    name: "Trí Trương",
    createdAt: "Hôm nay",
    expiredAt: "14/02/2027",
    duration: "yearly",
    packageName: "Premium",
    status: "cancelled",
  },
  {
    email: "tritruonghoang3@gmail.com",
    name: "Trí Trương",
    createdAt: "Hôm nay",
    expiredAt: "14/05/2026",
    duration: "3 months",
    packageName: "Premium",
    status: "overdue",
  },
];
export default function PackageOwnerDashboardPage() {
  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Quản lý hội viên
          </h1>
        </div>
      </div>
      {/* Content */}
      <div className="my-8">
        <PackageOwnerTable data={demoData} />
      </div>
    </div>
  );
}

function PackageOwnerTable({ data }: PackageOwnerTableProps) {
  const [, openLockModal] = useAtom(openLockModalAtom);
  const [, openUnlockModal] = useAtom(openUnlockModalAtom);
  const [, openCancelModal] = useAtom(openCancelModalAtom);
  const {
    page,
    pageSize,
    total,
    pagedData,
    handlePageChange,
    handlePageSizeChange,
  } = useClientPagination(data, { initialPageSize: 5 });

  const duration = {
    monthly: "Hằng tháng",
    "3 months": "3 tháng",
    "6 months": "6 tháng",
    "12 months": "12 tháng",
    yearly: "Hằng năm",
  };

  return (
    <DataTableShell
      columns={columns}
      isEmpty={data.length === 0}
      emptyMessage="Không tìm thấy hội viên nào trong hệ thống."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
      }}
    >
      {pagedData.map((row, i) => (
          <tr
            key={`${row.email}-${i}`}
            className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
          >
            {/* Info */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <OwnerAvatar name={row.name} />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {row.name}
                  </span>
                  <span className="dark:text-primary/90 text-[12px] font-semibold text-gray-900 italic">
                    {row.email}
                  </span>
                </div>
              </div>
            </td>

            {/* Created at */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {row.createdAt}
              </span>
            </td>

            {/* Expired At */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {row.expiredAt}
              </span>
            </td>

            {/* Package Type */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <div className="flex flex-col">
                <span
                  className={`text-sm font-semibold ${
                    row.packageName === "Premium"
                      ? "text-white"
                      : row.packageName === "Medimate"
                        ? "text-gray-200"
                        : "text-gray-300"
                  } `}
                >
                  {row.packageName}
                </span>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {row.packageName === "Basic"
                    ? "Miễn phí"
                    : duration[row.duration]}
                </span>
              </div>
            </td>

            {/* Status */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
              <StatusBadge status={row.status} />
            </td>

            {/* Actions */}
            <td className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                {row.status === "active" && (
                  <>
                    <Tooltip content="Khoá tạm thời">
                      <IconAction
                        onClick={() => openLockModal("owner_package", row.email)}
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

                {row.status === "blocked" && (
                  <>
                    <Tooltip content="Mở khoá">
                      <IconAction
                        onClick={() => openUnlockModal("owner_package", row.email)}
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

                {row.status === "overdue" && (
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
                {row.status === "pending" && (
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
        ))}
    </DataTableShell>
  );
}

function StatusBadge({
  status,
}: {
  status: "pending" | "active" | "overdue" | "cancelled" | "blocked";
}) {
  const map = {
    pending: <Badge type="info" value="Chưa kích hoạt" />,
    active: <Badge type="success" value="Đã kích hoạt" />,
    overdue: <Badge type="warning" value="Quá hạn" />,
    cancelled: <Badge type="error" value="Đã huỷ" />,
    blocked: <Badge type="error" value="Khoá tạm thời" />,
  };

  return map[status];
}

function OwnerAvatar({ name }: { name: string }) {
  return (
    <div className="relative h-10 w-10 shrink-0">
      <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-white/20 to-white/5 text-sm font-semibold text-white">
        {name.charAt(0)}
      </div>
    </div>
  );
}
