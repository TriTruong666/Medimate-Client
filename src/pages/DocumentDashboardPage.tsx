import { PiExport } from "react-icons/pi";
import Breadcrumb from "../components/Breadcrumb";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { Badge } from "../components/Badge";
import {
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import { BsFiletypeJson, BsFiletypeDocx, BsFiletypeTxt } from "react-icons/bs";

type DocumentRow = {
  name: string;
  updated: string;
  typeLabel: string;
  fileType: "pdf" | "json" | "text" | "docx" | "doc" | "txt";
  size: string;
  status: "uploaded" | "indexed" | "failed";
};

export default function DocumentDashboardPage() {
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

  const demoData: DocumentRow[] = [
    {
      name: "Project_Specs_v2.pdf",
      updated: "Updated 2 hours ago",
      fileType: "pdf",
      typeLabel: "PDF",
      size: "4.2 MB",
      status: "indexed",
    },
    {
      name: "SEP409.json",
      updated: "Updated yesterday",
      fileType: "json",
      typeLabel: "JSON",
      size: "156 MB",
      status: "uploaded",
    },
  ];
  return (
    <div className="mx-auto max-w-384 space-y-6">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Quản lý tài liệu
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/10">
            Xuất <PiExport />
          </button>

          <button className="from-primary to-primary/80 shadow-primary/30 flex items-center gap-2 rounded-xl bg-linear-to-br px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.03]">
            <MdOutlineDriveFolderUpload />
            Thêm tài liệu
          </button>
        </div>
      </div>
      <div className="my-8">
        <DocumentTable data={demoData} />
        <Pagination page={1} pageSize={20} total={500} />
      </div>
    </div>
  );
}

type ColumnKey = "name" | "type" | "size" | "status" | "actions";

type TableColumn = {
  key: ColumnKey;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
};

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
  },
  {
    key: "size",
    label: "Kích thước",
    width: "w-[15%]",
    align: "left",
  },
  {
    key: "status",
    label: "Trạng thái",
    width: "w-[20%]",
    align: "left",
  },
  {
    key: "actions",
    label: "Thao tác",
    width: "w-[20%]",
    align: "center",
  },
];

type DocumentTableProps = {
  data: DocumentRow[];
};

export function DocumentTable({ data }: DocumentTableProps) {
  return (
    <table className="dark:border-border-dark w-full min-w-225 table-fixed border-collapse border border-gray-100 text-left">
      <thead>
        <tr className="dark:bg-border-dark/30 bg-gray-50/50">
          {columns.map((col, i) => (
            <th
              key={col.key}
              className={`border-b p-4 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400 ${col.width ?? ""} ${col.align === "center" ? "text-center!" : ""} ${col.align === "right" ? "text-right!" : "text-left!"} ${
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
            {/* Name */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <FileIcon type={row.fileType} />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {row.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {row.updated}
                  </span>
                </div>
              </div>
            </td>

            {/* Type */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {row.typeLabel}
              </span>
            </td>

            {/* Size */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
              <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
                {row.size}
              </span>
            </td>

            {/* Status */}
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
              <StatusBadge status={row.status} />
            </td>

            {/* Actions */}
            <td className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <IconAction icon={<HiOutlineDownload />} />
                <IconAction icon={<HiOutlinePencil />} />
                {row.status === "failed" && (
                  <IconAction icon={<HiOutlineRefresh />} />
                )}
                <IconAction icon={<HiOutlineTrash />} danger />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IconAction({
  icon,
  danger = false,
}: {
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      className={`rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${
        danger
          ? "hover:text-red-500 dark:hover:text-red-400"
          : "hover:text-primary dark:hover:text-white"
      }`}
    >
      {icon}
    </button>
  );
}

function FileIcon({ type }: { type: DocumentRow["fileType"] }) {
  const map: Record<
    DocumentRow["fileType"],
    { icon: React.ReactNode; className: string }
  > = {
    pdf: {
      icon: <HiOutlineDocumentText />,
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
  };

  const item = map[type];

  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.className}`}
    >
      {item.icon}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "uploaded" | "indexed" | "failed";
}) {
  const map = {
    indexed: <Badge type="success" value="Indexed" />,
    uploaded: <Badge type="info" value="Uploaded" />,
    failed: <Badge type="error" value="Failed" />,
  };

  return map[status];
}

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
    <div className="dark:border-border-dark flex items-center justify-between border-x border-b border-gray-100 px-4 py-3">
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
