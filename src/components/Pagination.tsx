import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
};
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="dark:border-border-dark flex items-center justify-between border border-gray-100 px-4 py-3">
      {/* Info */}
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Page <span className="font-medium">{page}</span> of{" "}
        <span className="font-medium">{totalPages}</span>
      </span>

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
