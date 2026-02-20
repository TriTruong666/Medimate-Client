/* eslint-disable @typescript-eslint/no-unused-vars */
import { IoLockClosedOutline, IoLockOpenOutline } from "react-icons/io5";
import { Badge } from "../components/Badge";
import Breadcrumb from "../components/Breadcrumb";
import GlassSelect from "../components/Select";
import { useState } from "react";
import { PiExport } from "react-icons/pi";
import {
  openLockModalAtom,
  openModalAtom,
  openUnlockModalAtom,
} from "../stores/modalStore";
import { useAtom } from "jotai";
import { FiUserPlus } from "react-icons/fi";
import { Pagination } from "../components/Pagination";
import IconAction from "../components/IconAction";
import { Tooltip } from "../components/Tooltip";

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

type AccountTableProps = {
  data: AccountRow[];
};

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
const demoData: AccountRow[] = [
  {
    name: "Trí Trương",
    createdAt: "Tham gia vào 26/03/2025",
    email: "tritruonghoang3@gmail.com",
    phone: "0776003669",
    role: "admin",
    status: "online",
  },
  {
    name: "Phan Hân",
    createdAt: "Tham gia vào 13/01/2025",
    email: "hancute1301@gmail.com",
    phone: "0123456789",
    role: "admin",
    status: "offline",
  },
  {
    name: "Thằng Sáng",
    createdAt: "Tham gia vào 01/02/2025",
    email: "taoghecthangsang@gmail.com",
    phone: "0987654312",
    role: "patient",
    status: "locked",
  },
  {
    name: "Mr.Quốc Huy",
    createdAt: "Tham gia vào 10/05/2025",
    email: "anhhuyganhteam@gmail.com",
    phone: "0651276372",
    role: "admin",
    status: "offline",
  },
];
export default function AccountDashboardPage() {
  const [type, setType] = useState("");
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
              onChange={setType}
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
        <AccountTable data={demoData} />
        <Pagination page={1} pageSize={20} total={demoData.length} />
      </div>
    </div>
  );
}

function AccountTable({ data }: AccountTableProps) {
  const [, openLockModal] = useAtom(openLockModalAtom);
  const [, openUnlockModal] = useAtom(openUnlockModalAtom);

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
            {/* Info */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <AccountAvatar name={row.name} />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {row.name}
                  </span>
                  <span className="dark:text-primary/90 text-[12px] font-semibold text-gray-900 italic">
                    {row.email}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {row.createdAt}
                  </span>
                </div>
              </div>
            </td>

            {/* Phone */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {row.phone}
              </span>
            </td>

            {/* Role */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
              <span className="font-mono text-sm text-gray-600 uppercase dark:text-gray-300">
                {row.role}
              </span>
            </td>

            {/* Status */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
              <StatusBadge status={row.status} />
            </td>

            {/* Actions */}
            <td className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                {row.status === "locked" && (
                  <Tooltip content="Mở khoá">
                    <IconAction
                      onClick={() => openUnlockModal("account")}
                      icon={<IoLockOpenOutline />}
                    />
                  </Tooltip>
                )}
                {row.status !== "locked" && (
                  <Tooltip content="Khoá tài khoản">
                    <IconAction
                      onClick={() => openLockModal("account")}
                      icon={<IoLockClosedOutline />}
                      danger
                    />
                  </Tooltip>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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
