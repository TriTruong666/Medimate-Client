import { Spinner } from "@/components/custom-ui/Spinner";
import { Pagination } from "@/components/custom-ui/Pagination";
import type { ReactNode } from "react";

export type DataTableColumn = {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
};

type DataTableShellProps = {
  columns: DataTableColumn[];
  children?: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange?: (page: number) => void;
  };
  tableClassName?: string;
  tbodyClassName?: string;
};

export function DataTableShell({
  columns,
  children,
  isLoading = false,
  isError = false,
  isEmpty = false,
  loadingMessage = "Đang tải dữ liệu...",
  errorMessage = "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
  emptyTitle = "Danh sách trống",
  emptyMessage = "Không tìm thấy dữ liệu nào.",
  onRetry,
  pagination,
  tableClassName = "dark:border-border-dark w-full min-w-225 table-fixed border-collapse border-x border-t border-gray-100 text-left",
  tbodyClassName = "dark:divide-border-dark divide-y divide-gray-100",
}: DataTableShellProps) {
  const colCount = columns.length;

  return (
    <>
      <table className={tableClassName}>
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

        <tbody className={tbodyClassName}>
          {isLoading ? (
            <tr>
              <td colSpan={colCount}>
                <div className="flex min-h-100 w-full flex-col items-center justify-center py-10">
                  <Spinner size="lg" />
                  <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {loadingMessage}
                  </p>
                </div>
              </td>
            </tr>
          ) : isError ? (
            <tr>
              <td colSpan={colCount}>
                <div className="flex min-h-100 w-full flex-col items-center justify-center py-10">
                  <h3 className="mt-4 text-lg text-white">Đã xảy ra lỗi</h3>
                  <p className="mt-1 max-w-75 text-center text-sm text-gray-400">
                    {errorMessage}
                  </p>
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="mt-6 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                      Thử lại
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ) : isEmpty ? (
            <tr>
              <td colSpan={colCount}>
                <div className="flex min-h-100 w-full flex-col items-center justify-center py-10">
                  <h3 className="mt-4 text-lg text-white">{emptyTitle}</h3>
                  <p className="mt-1 text-sm text-gray-400">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>

      {pagination && (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={pagination.onPageChange}
        />
      )}
    </>
  );
}
