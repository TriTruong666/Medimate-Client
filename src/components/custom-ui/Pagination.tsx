import { useState, useRef, useEffect } from "react";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiChevronDown,
} from "react-icons/hi";

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
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (page < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="dark:border-border-dark flex items-center justify-between border-x border-b border-gray-400 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      {/* Info & Page Size */}
      <div className="flex items-center gap-6">
        <div className="hidden items-center gap-4 border-r border-gray-400 pr-6 sm:flex dark:border-white/10">
          <span className="text-xs text-gray-500 dark:text-white/60">
            Tổng{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {total}
            </span>{" "}
            bản ghi
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Trang{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {page}
            </span>{" "}
            /{" "}
            <span className="font-medium text-gray-900 dark:text-gray-200">
              {totalPages}
            </span>
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange?.(page - 1)}
          className={`inline-flex items-center gap-1 rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
            page === 1
              ? "cursor-not-allowed border-gray-400 text-gray-400 opacity-50 dark:border-white/5 dark:text-gray-600"
              : "border-gray-400 text-gray-600 hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20 dark:hover:bg-white/5"
          } `}
        >
          <HiOutlineChevronLeft className="text-sm" />
          Trước
        </button>

        <div className="mx-1 flex items-center gap-1.5">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`dots-${idx}`}
                  className="px-1 text-xs text-gray-500"
                >
                  ...
                </span>
              );
            }

            const active = p === page;
            return (
              <button
                key={p}
                onClick={() => onPageChange?.(p as number)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "border-primary/30 bg-primary/10 text-primary border shadow-sm"
                    : "border border-gray-400 text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange?.(page + 1)}
          className={`inline-flex items-center gap-1 rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
            page === totalPages
              ? "cursor-not-allowed border-gray-400 text-gray-400 opacity-50 dark:border-white/5 dark:text-gray-600"
              : "border-gray-400 text-gray-600 hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20 dark:hover:bg-white/5"
          } `}
        >
          Sau
          <HiOutlineChevronRight className="text-sm" />
        </button>
      </div>
    </div>
  );
}

function PaginationSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/3 px-3 py-2 text-[12px] font-medium text-white backdrop-blur-md transition hover:bg-white/6 focus:outline-none"
      >
        <span>{selected?.label}</span>
        <HiChevronDown
          className={`h-3.5 w-3.5 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-max min-w-full -translate-x-1/2 overflow-hidden rounded-xl border border-white/10 bg-neutral-900/95 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <ul className="max-h-48 overflow-y-auto">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center px-4 py-2 text-xs transition ${
                    opt.value === value
                      ? "bg-primary/20 text-primary font-bold"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  } `}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
