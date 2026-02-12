/* eslint-disable @typescript-eslint/no-unused-vars */
import { motion } from "framer-motion";
import { PiExport } from "react-icons/pi";
import Breadcrumb from "../components/Breadcrumb";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { Badge } from "../components/Badge";
import {
  HiOutlineDownload,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineRefresh,
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
import { cardContainer, cardItem } from "../motions/cardMotion";
import { useAtom } from "jotai";
import { openModalAtom } from "../stores/modalStore";
import { AiOutlineFileMarkdown, AiOutlineFilePdf } from "react-icons/ai";
import GlassSelect from "../components/Select";
import { Pagination } from "../components/Pagination";

type DocumentRow = {
  name: string;
  updated: string;
  typeLabel: string;
  fileType:
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
  size: string;
  status: "uploaded" | "indexed" | "failed" | "indexing";
};

type ColumnKey = "name" | "type" | "size" | "status" | "actions";

type TableColumn = {
  key: ColumnKey;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
};
type DocumentCardGridProps = {
  data: DocumentRow[];
};

type DocumentCardProps = {
  data: DocumentRow;
};

type DocumentTableProps = {
  data: DocumentRow[];
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

  const demoData: DocumentRow[] = [
    {
      name: "Project_Specs_v2.pdf",
      updated: "Thêm vào 2 tiếng trước",
      fileType: "pdf",
      typeLabel: "PDF",
      size: "4.2 MB",
      status: "indexed",
    },
    {
      name: "SEP409.json",
      updated: "Cập nhật hôm qua",
      fileType: "json",
      typeLabel: "JSON",
      size: "156 MB",
      status: "uploaded",
    },
    {
      name: "Medimate.docx",
      updated: "Cập nhật hôm qua",
      fileType: "docx",
      typeLabel: "DOCX",
      size: "1.2 MB",
      status: "indexing",
    },
    {
      name: "Medimate.docx",
      updated: "Cập nhật hôm qua",
      fileType: "docx",
      typeLabel: "DOCX",
      size: "1.2 MB",
      status: "failed",
    },
    {
      name: "Medimate.docx",
      updated: "Cập nhật hôm qua",
      fileType: "docx",
      typeLabel: "DOCX",
      size: "1.2 MB",
      status: "failed",
    },
    {
      name: "Medimate.docx",
      updated: "Cập nhật hôm qua",
      fileType: "docx",
      typeLabel: "DOCX",
      size: "1.2 MB",
      status: "failed",
    },
    {
      name: "Medimate.docx",
      updated: "Cập nhật hôm qua",
      fileType: "docx",
      typeLabel: "DOCX",
      size: "1.2 MB",
      status: "failed",
    },
    {
      name: "Medimate.docx",
      updated: "Cập nhật hôm qua",
      fileType: "docx",
      typeLabel: "DOCX",
      size: "1.2 MB",
      status: "failed",
    },
    {
      name: "Medimate.docx",
      updated: "Cập nhật hôm qua",
      fileType: "docx",
      typeLabel: "DOCX",
      size: "1.2 MB",
      status: "failed",
    },
    {
      name: "Medimate.docx",
      updated: "Cập nhật hôm qua",
      fileType: "docx",
      typeLabel: "DOCX",
      size: "1.2 MB",
      status: "failed",
    },
    {
      name: "Medimate.docx",
      updated: "Cập nhật hôm qua",
      fileType: "docx",
      typeLabel: "DOCX",
      size: "1.2 MB",
      status: "failed",
    },
    {
      name: "Medimate.docx",
      updated: "Cập nhật hôm qua",
      fileType: "docx",
      typeLabel: "DOCX",
      size: "1.2 MB",
      status: "failed",
    },
  ];

  const handleChangeTableLayout = (key: string) => {
    setTableLayout(key);
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
          <DocumentTable data={demoData} />

          <Pagination page={1} pageSize={20} total={500} />
        </div>
      )}

      {tableLayout === "card" && (
        <div className="my-8 space-y-8">
          <DocumentCardGrid data={demoData} />
          <div className="flex justify-center">
            {" "}
            <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-gray-300 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/10">
              Tải thêm tài liệu <LuPlus />
            </button>
          </div>
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

function DocumentCardGrid({ data }: DocumentCardGridProps) {
  return (
    <motion.div
      variants={cardContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {data.map((doc) => (
        <DocumentCard key={doc.name} data={doc} />
      ))}
    </motion.div>
  );
}

function DocumentCard({ data }: DocumentCardProps) {
  return (
    <motion.div
      variants={cardItem}
      whileHover={{ y: -4 }}
      className="group dark:border-border-dark relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white/80 p-4 backdrop-blur transition-colors duration-300 hover:border-white/20 hover:bg-white/10 dark:bg-white/5"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <FileIcon type={data.fileType} />

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {data.name}
          </h4>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {data.updated}
          </p>
        </div>
      </div>

      <div className="my-4 h-px bg-gray-100 dark:bg-white/10" />

      {/* Meta */}
      <div className="flex items-center justify-between text-xs">
        <span className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 font-medium text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-300">
          {data.typeLabel}
        </span>

        <span className="font-mono text-gray-500 dark:text-gray-400">
          {data.size}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <StatusBadge status={data.status} />

        <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
          <IconAction icon={<HiOutlineDownload />} />
          {data.status === "failed" && (
            <IconAction icon={<HiOutlineRefresh />} />
          )}
          <IconAction icon={<HiOutlineTrash />} danger />
        </div>
      </div>
    </motion.div>
  );
}

function DocumentTable({ data }: DocumentTableProps) {
  return (
    <table className="dark:border-border-dark w-full min-w-225 table-fixed border-collapse border-x border-t border-gray-100 text-left">
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
  className = "",
}: {
  icon: React.ReactNode;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${
        danger
          ? "hover:text-red-500 dark:hover:text-red-400"
          : "hover:text-primary dark:hover:text-white"
      } ${className}`}
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
  status: "uploaded" | "indexed" | "failed" | "indexing";
}) {
  const map = {
    indexed: <Badge type="success" value="Đã nạp" />,
    indexing: <Badge type="warning" value="Đang nạp" />,
    uploaded: <Badge type="info" value="Đã đăng tải" />,
    failed: <Badge type="error" value="Thất bại" />,
  };

  return map[status];
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
