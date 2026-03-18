/* eslint-disable @typescript-eslint/no-unused-vars */
import { Badge } from "../../components/custom-ui/Badge";
import Breadcrumb from "../../components/custom-ui/Breadcrumb";
import GlassSelect from "../../components/custom-ui/Select";
import { useMemo, useState } from "react";
import { PiExport } from "react-icons/pi";
import {
  openLockModalAtom,
  openModalAtom,
  openUnlockModalAtom,
} from "../../stores/modalStore";
import { useAtom } from "jotai";
import { FiUserPlus } from "react-icons/fi";
import { Pagination } from "../../components/custom-ui/Pagination";

import { formatRelativeTime } from "@/common/format";
import { useUserList } from "@/hooks/data/useAccountHooks";
import { sortUsers } from "@/common/account";
import type { User } from "@/types/User";
import { IoMdLock, IoMdUnlock } from "react-icons/io";
import { Spinner } from "@/components/custom-ui/Spinner";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import IconAction from "@/components/custom-ui/IconAction";
import type { PaginationParams } from "@/common/query.params";

type AccountRow = {
  name: string;
  email: string;
  createdAt: string;
  role: "admin" | "manager" | "patient" | "doctor" | "inspector";
  phone: string;
  status: "online" | "offline" | "locked";
};

type ColumnKey = "info" | "phone" | "role" | "status" | "actions";

type TableColumn = {
  key: ColumnKey;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
};

type SortType = "" | "by_date" | "by_status";

const breadcrumbItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Tài khoản",
    path: "/dashboard/accounts",
  },
  {
    label: "Tất cả",
  },
];

const columns: TableColumn[] = [
  {
    key: "info",
    label: "Thông tin cá nhân",
    width: "w-[35%]",
  },
  {
    key: "phone",
    label: "Điện thoại",
    width: "w-[20%]",
  },
  {
    key: "role",
    label: "Chức vụ",
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

export default function AccountDashboardPage() {
  const [type, setType] = useState<SortType>("");
  const [, openModal] = useAtom(openModalAtom);

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Quản lý tài khoản
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="ml-2">
            <GlassSelect
              value={type}
              onChange={(value) => setType(value as SortType)}
              placeholder="Sắp xếp theo"
              options={[
                { label: "Ngày", value: "by_date" },
                { label: "Trạng thái", value: "by_status" },
              ]}
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-gray-300 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/10">
            Xuất <PiExport />
          </button>

          <button
            onClick={() => openModal("add_account")}
            className="btn-primary"
          >
            <FiUserPlus />
            Thêm tài khoản
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="my-8">
        <AccountTable sortType={type} />
      </div>
    </div>
  );
}

function AccountTable({ sortType }: { sortType: SortType }) {
  const [pagination, setPagination] = useState<PaginationParams>({
    pageNumber: 1,
    pageSize: 5,
  });
  const { data, isLoading, error, isError, refetch } = useUserList(pagination);

  const users = data?.items ?? [];
  const total = data?.totalCount ?? 0;
  const pageNumber = data?.pageNumber ?? pagination.pageNumber ?? 1;
  const pageSize = data?.pageSize ?? pagination.pageSize ?? 5;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const [, openLockModal] = useAtom(openLockModalAtom);
  const [, openUnlockModal] = useAtom(openUnlockModalAtom);

  const accountRoleMap: Record<User["role"], string> = {
    Admin: "Quản trị viên",
    Doctor: "Bác sĩ",
    DoctorManager: "Kiểm soát viên",
    User: "Khách hàng",
  };

  const sortedUsers = useMemo(() => {
    if (!users) return [];
    return sortUsers(users, sortType);
  }, [users, sortType]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === pageNumber) return;

    setPagination((prev) => ({
      ...prev,
      pageNumber: nextPage,
    }));
  };

  return (
    <>
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
          {isLoading ? (
            // Trạng thái loading
            <tr>
              <td colSpan={columns.length}>
                <div className="flex min-h-100 w-full flex-col items-center justify-center py-10">
                  <Spinner size="lg" />
                  <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Đang tải dữ liệu...
                  </p>
                </div>
              </td>
            </tr>
          ) : isError ? (
            // Trạng thái lỗi
            <tr>
              <td colSpan={columns.length}>
                <div className="flex min-h-100 w-full flex-col items-center justify-center py-10">
                  <h3 className="mt-4 text-lg text-white">Đã xảy ra lỗi</h3>
                  <p className="mt-1 max-w-75 text-center text-sm text-gray-400">
                    {error?.message ||
                      "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="mt-6 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Thử lại
                  </button>
                </div>
              </td>
            </tr>
          ) : users && users.length > 0 ? (
            sortedUsers.map((row) => (
              // Happy case
              <tr
                key={row.userId}
                className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
              >
                <td className="dark:border-border-dark border-r border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <AccountAvatar name={row.fullName} />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {row.fullName}
                      </span>
                      <span className="dark:text-primary/90 text-[12px] font-semibold text-gray-900 italic">
                        {row.email}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(row.createdAt)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="dark:border-border-dark border-r border-gray-100 p-4">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {row.phoneNumber}
                  </span>
                </td>
                <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
                  <span className="text-[13px] text-gray-600 dark:text-gray-300">
                    {accountRoleMap[row.role]}
                  </span>
                </td>
                <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
                  <StatusBadge status={row.isOnline ? "online" : row.isActive ? "offline" : "locked"} />
                </td>
                {/* Actions */}
                {row.isActive === true ? (
                  <td className="p-4 text-center">
                  <Tooltip content="Vô hiệu hóa tài khoản">
                    <IconAction
                      onClick={() => openLockModal("account", row.userId)}
                      danger
                      icon={<IoMdLock className="text-red-400"/>}
                    />
                  </Tooltip>
                </td>
                ) : (
                  <td className="p-4 text-center">
                  <Tooltip content="Kích hoạt tài khoản">
                    <IconAction
                      onClick={() => openUnlockModal("account", row.userId)}
                      icon={<IoMdUnlock />}
                    />
                  </Tooltip>
                </td>
                )}
                
              </tr>
            ))
          ) : (
            // Trường hợp empty list
            <tr>
              <td colSpan={columns.length}>
                <div className="flex min-h-100 w-full flex-col items-center justify-center py-10">
                  <h3 className="mt-4 text-lg text-white">Danh sách trống</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Không tìm thấy tài khoản nào trong hệ thống.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination
        page={pageNumber}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
      />
    </>
  );
}

function StatusBadge({ status }: { status: "online" | "offline" | "locked" }) {
  const map = {
    online: <Badge type="success" value="Trực tuyến" />,
    offline: <Badge type="info" value="Ngoại tuyến" />,
    locked: <Badge type="error" value="Khoá tạm thời" />,
  };

  return map[status];
}

function AccountAvatar({ name }: { name: string }) {
  return (
    <div className="relative h-10 w-10 shrink-0">
      <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-white/20 to-white/5 text-sm font-semibold text-white">
        {name.charAt(0)}
      </div>
    </div>
  );
}
