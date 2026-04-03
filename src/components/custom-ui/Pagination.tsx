import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
};
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="dark:border-border-dark flex items-center justify-between border border-gray-100 px-4 py-3">
      {/* Info & Page Size */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r pr-6 dark:border-white/10 border-gray-100">
          <span className="text-xs text-gray-500 dark:text-white">
            Tổng {total} bản ghi
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Trang <span className="font-medium">{page}</span> trên{" "}
            <span className="font-medium">{totalPages}</span>
          </span>
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Hiển thị</span>
            <div className="relative group/select">
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="appearance-none bg-white/5 border border-white/10 rounded-md px-2 py-1 text-[11px] font-bold text-gray-300 outline-none cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all min-w-[48px] text-center"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#121212] text-white">
                    {opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 group-hover/select:text-white transition-colors">
                {/* Custom arrow could go here if appearance-none was fully exploited, but keeping it simple for now */}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange?.(page - 1)}
          className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
            page === 1
              ? "dark:border-border-dark/40 cursor-not-allowed border-gray-200 text-gray-400"
              : "dark:border-border-dark border-gray-200 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
          } `}
        >
          <HiOutlineChevronLeft className="text-sm" />
          Prev
        </button>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange?.(page + 1)}
          className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
            page === totalPages
              ? "dark:border-border-dark/40 cursor-not-allowed border-gray-200 text-gray-400"
              : "dark:border-border-dark border-gray-200 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
          } `}
        >
          Next
          <HiOutlineChevronRight className="text-sm" />
        </button>
      </div>
    </div>
  );
}
