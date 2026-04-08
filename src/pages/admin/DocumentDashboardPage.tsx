/* eslint-disable @typescript-eslint/no-unused-vars */
import { motion } from "framer-motion";
import { PiExport } from "react-icons/pi";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import {
  HiOutlineDownload,
  HiOutlineTrash,
} from "react-icons/hi";
import {
  BsFiletypeJson,
  BsFiletypeDocx,
  BsFiletypeTxt,
  BsFiletypeCsv,
  BsFiletypeXlsx,
  BsFiletypeHtml,
} from "react-icons/bs";
import { LuGrid3X3, LuPlus, LuTable2 } from "react-icons/lu";
import { useState } from "react";
import { useAtom } from "jotai";
import { AiOutlineFileMarkdown, AiOutlineFilePdf } from "react-icons/ai";
import { openDeleteModalAtom, openModalAtom } from "@/stores/modalStore";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import GlassSelect from "@/components/custom-ui/Select";
import { cardContainer, cardItem } from "@/motions/cardMotion";
import { Badge } from "@/components/custom-ui/Badge";
import IconAction from "@/components/custom-ui/IconAction";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import { formatRelativeTime } from "@/common/format";
import type { RAGDocument } from "@/types/RAGDocument";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import { useEffect } from "react";
import { FiPlus, FiRefreshCcw } from "react-icons/fi";
import { Spinner } from "@/components/custom-ui/Spinner";
import { useRAGDocuments } from "@/hooks/data/useRAGDocumentHooks";

type ColumnKey = "name" | "type" | "size" | "status" | "actions";

type TableColumn = {
  key: ColumnKey;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
};

type DocumentCardGridProps = {
  data: RAGDocument[];
};

type DocumentCardProps = {
  data: RAGDocument;
};

type DocumentTableProps = {
  data: RAGDocument[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
};

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function DocumentDashboardPage() {
  const [type, setType] = useState("");
  const [, openModal] = useAtom(openModalAtom);
  const [tableLayout, setTableLayout] = useState("table");
  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Tài liệu",
      path: "/dashboard/documents",
    },
    {
      label: "Tất cả",
    },
  ];

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // Tăng size cho card view
  const [searchQuery] = useState("");
  const [allDocuments, setAllDocuments] = useState<RAGDocument[]>([]);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useRAGDocuments({
    page,
    limit: pageSize,
    q: searchQuery,
  });

  const total = response?.data.pagination.total_records || 0;
  
  // Dữ liệu hiển thị cho Card view (Infinity)
  const cardDocuments = page === 1 ? (response?.data.items || []) : allDocuments;
  const hasMore = cardDocuments.length < total;

  // Xử lý nạp thêm dữ liệu vào allDocuments khi page > 1
  useEffect(() => {
    if (response?.data.items) {
      if (page === 1) {
        setAllDocuments(response.data.items);
      } else {
        // Tránh trùng lặp nếu response chưa kịp đổi
        setAllDocuments((prev) => {
          const combined = [...prev, ...response.data.items];
          // Simple deduplication by ID
          const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
          return unique;
        });
      }
    }
  }, [response, page]);

  // Reset khi search
  useEffect(() => {
    setPage(1);
    setAllDocuments([]);
  }, [searchQuery]);

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleChangeTableLayout = (key: string) => {
    setTableLayout(key);
    // Reset về trang 1 khi đổi layout để tránh confusion
    setPage(1);
  };

  return (
    <div className="page-layout">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Quản lý tài liệu
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-lg bg-white/5 p-1">
            <button
              onClick={() => handleChangeTableLayout("table")}
              className={`${tableLayout === "table" ? "bg-primary text-white shadow-sm" : "text-gray-400 hover:bg-white/5 hover:text-white"} flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition`}
            >
              <LuTable2 className="text-sm" />
              Bảng
            </button>
            <button
              onClick={() => handleChangeTableLayout("card")}
              className={`${tableLayout === "card" ? "bg-primary text-white shadow-sm" : "text-gray-400 hover:bg-white/5 hover:text-white"} flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition`}
            >
              <LuGrid3X3 className="text-sm" />
              Thẻ
            </button>
          </div>
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

          <button onClick={() => openModal("upload")} className="btn-primary">
            <MdOutlineDriveFolderUpload />
            Thêm tài liệu
          </button>
        </div>
      </div>
      {tableLayout === "table" && (
        <div className="my-8">
          <DocumentTable
            data={response?.data.items || []}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
          />
        </div>
      )}

      {tableLayout === "card" && (
        <div className="my-8">
          {isLoading && cardDocuments.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <DocumentCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center py-10">
              <div className="mb-4 rounded-full bg-red-500/10 p-4 text-red-500">
                <FiRefreshCcw className="text-3xl" />
              </div>
              <h3 className="text-lg font-semibold text-white">Đã xảy ra lỗi</h3>
              <p className="mt-2 text-sm text-white/50">
                Không thể tải danh sách tài liệu vào lúc này.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-6 rounded-lg border border-white/5 bg-white/5 px-6 py-2.5 text-xs font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                Thử lại
              </button>
            </div>
          ) : cardDocuments.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 rounded-full bg-white/5 p-4 text-gray-400">
                <LuGrid3X3 className="text-3xl" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Chưa có tài liệu
              </h3>
              <p className="mt-2 text-sm text-white/50">
                Bắt đầu bằng cách tải lên tài liệu đầu tiên của bạn.
              </p>
              <button
                onClick={() => openModal("upload")}
                className="mt-6 flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2.5 text-xs font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-red-600"
              >
                <LuPlus className="text-lg" />
                Tải lên ngay
              </button>
            </div>
          ) : (
            /* 4. DATA RENDER */
            <div className="space-y-10">
              <DocumentCardGrid data={cardDocuments} />

              {hasMore && (
                <div className="flex justify-center pb-10">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="flex min-w-40 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/10 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" /> <span>Đang tải...</span>
                      </>
                    ) : (
                      <>
                        Tải thêm tài liệu <LuPlus />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const columns: TableColumn[] = [
  {
    key: "name",
    label: "Tên tài liệu",
    width: "w-[30%]",
  },
  {
    key: "type",
    label: "Loại",
    width: "w-[15%]",
    align: "center",
  },
  {
    key: "size",
    label: "Kích thước",
    width: "w-[15%]",
    align: "center",
  },
  {
    key: "status",
    label: "Trạng thái",
    width: "w-[20%]",
    align: "center",
  },
  {
    key: "actions",
    label: "Thao tác",
    width: "w-[20%]",
    align: "center",
  },
];

function DocumentCardGrid({ data }: DocumentCardGridProps) {
  return (
    <motion.div
      variants={cardContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {data.map((doc) => (
        <DocumentCard key={doc.id} data={doc} />
      ))}
    </motion.div>
  );
}

function DocumentCard({ data }: DocumentCardProps) {
  const [, openDeleteModal] = useAtom(openDeleteModalAtom);

  return (
    <motion.div
      variants={cardItem}
      whileHover={{ y: -4 }}
      className="group dark:border-border-dark relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white/80 p-4 backdrop-blur transition-colors duration-300 hover:border-white/20 hover:bg-white/10 dark:bg-white/5"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <FileIcon type={data.type as any} />

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {data.doc_name}
          </h4>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formatRelativeTime(data.created_at)}
          </p>
        </div>
      </div>

      <div className="my-4 h-px bg-gray-100 dark:bg-white/10" />

      {/* Meta */}
      <div className="flex items-center justify-between text-xs">
        <span className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 font-medium text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-300">
          {(data.type || "N/A").toUpperCase()}
        </span>

        <span className="font-mono text-gray-500 dark:text-gray-400">
          {formatFileSize(data.file_size)}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <StatusBadge status={data.status as any} />

        <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
          <Tooltip content="Tải xuống">
            <IconAction icon={<HiOutlineDownload />} />
          </Tooltip>
          <Tooltip content="Xoá tài liệu">
            <IconAction
              onClick={() => openDeleteModal("document")}
              icon={<HiOutlineTrash />}
              danger
            />
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
}

function DocumentTable({
  data,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  isLoading,
  isError,
  onRetry,
}: DocumentTableProps & { isError?: boolean; onRetry?: () => void }) {
  const [, openDeleteModal] = useAtom(openDeleteModalAtom);
  return (
    <DataTableShell
      columns={columns}
      isEmpty={total === 0}
      emptyMessage="Không tìm thấy dữ liệu tài liệu."
      pagination={{ page, pageSize, total, onPageChange, onPageSizeChange }}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
    >
      {data.map((row, i) => (
        <tr
          key={row.id || i}
          className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
        >
          {/* Name */}
          <td className="dark:border-border-dark border-r border-gray-100 p-4">
            <div className="flex items-center gap-3 min-w-0">
              <FileIcon type={row.type as any} />
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {row.doc_name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(row.created_at)}
                </span>
              </div>
            </div>
          </td>

          {/* Type */}
          <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {(row.type || "N/A").toUpperCase()}
            </span>
          </td>

          {/* Size */}
          <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
            <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
              {formatFileSize(row.file_size)}
            </span>
          </td>

          {/* Status */}
          <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
            <StatusBadge status={row.status as any} />
          </td>

          {/* Actions */}
          <td className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Tooltip content="Tải xuống">
                <IconAction icon={<HiOutlineDownload />} />
              </Tooltip>
              <Tooltip content="Xoá tài liệu">
                <IconAction
                  onClick={() => openDeleteModal("document")}
                  icon={<HiOutlineTrash />}
                  danger
                />
              </Tooltip>
            </div>
          </td>
        </tr>
      ))}
    </DataTableShell>
  );
}

function FileIcon({
  type,
}: {
  type:
  | "pdf"
  | "json"
  | "text"
  | "docx"
  | "doc"
  | "txt"
  | "csv"
  | "xls"
  | "xlsx"
  | "html"
  | "md";
}) {
  const map: Record<string, { icon: React.ReactNode; className: string }> = {
    pdf: {
      icon: <AiOutlineFilePdf />,
      className: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    },
    docx: {
      icon: <BsFiletypeDocx />,
      className:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    doc: {
      icon: <BsFiletypeDocx />,
      className:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    },
    json: {
      icon: <BsFiletypeJson />,
      className:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    },
    text: {
      icon: <BsFiletypeTxt />,
      className:
        "bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400",
    },
    txt: {
      icon: <BsFiletypeTxt />,
      className:
        "bg-purple-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    csv: {
      icon: <BsFiletypeCsv />,
      className:
        "bg-purple-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    html: {
      icon: <BsFiletypeHtml />,
      className:
        "bg-purple-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    xls: {
      icon: <BsFiletypeXlsx />,
      className:
        "bg-purple-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    xlsx: {
      icon: <BsFiletypeXlsx />,
      className:
        "bg-purple-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    md: {
      icon: <AiOutlineFileMarkdown />,
      className:
        "bg-purple-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
  };

  const item = map[type] || {
    icon: <BsFiletypeTxt />,
    className:
      "bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400",
  };

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.className}`}
    >
      {item.icon}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "uploaded" | "indexed" | "failed" | "indexing";
}) {
  const map = {
    indexed: <Badge type="success" value="Đã nạp" />,
    indexing: <Badge type="warning" value="Đang nạp" />,
    uploaded: <Badge type="info" value="Đã đăng tải" />,
    failed: <Badge type="error" value="Thất bại" />,
  };

  return map[status] || <Badge type="info" value={status} />;
}

function DocumentCardSkeleton() {
  return (
    <div className="dark:border-border-dark flex h-48 flex-col rounded-2xl border border-gray-100 bg-white/5 p-4 backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-white/10" />
        </div>
      </div>
      <div className="mt-8 h-px w-full bg-white/5" />
      <div className="mt-auto flex items-center justify-between">
        <div className="h-6 w-16 animate-pulse rounded-full bg-white/10" />
        <div className="flex gap-2">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-white/10" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-white/10" />
        </div>
      </div>
    </div>
  );
}

// const PAGE_SIZE = 5;

// export function DocumentTableWrapper({ data }: { data: DocumentRow[] }) {
//   const [page, setPage] = useState(1);

//   const paginatedData = useMemo(() => {
//     const start = (page - 1) * PAGE_SIZE;
//     return data.slice(start, start + PAGE_SIZE);
//   }, [data, page]);

//   return (
//     <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-border-dark">
//       <DocumentTable data={paginatedData} />

//       <Pagination
//         page={page}
//         pageSize={PAGE_SIZE}
//         total={data.length}
//         onPageChange={setPage}
//       />
//     </div>
//   );
// }
