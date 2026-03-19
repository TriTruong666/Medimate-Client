import { useMemo, useState } from "react";

type UseClientPaginationOptions = {
  initialPage?: number;
  initialPageSize?: number;
};

export function useClientPagination<T>(
  data: T[],
  options: UseClientPaginationOptions = {},
) {
  const { initialPage = 1, initialPageSize = 5 } = options;
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) return;
    setPage(nextPage);
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  return {
    page: currentPage,
    pageSize,
    total,
    pagedData,
    handlePageChange,
    handlePageSizeChange,
  };
}
