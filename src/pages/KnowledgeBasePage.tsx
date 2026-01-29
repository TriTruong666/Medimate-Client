/* eslint-disable @typescript-eslint/no-unused-vars */
import Breadcrumb from "../components/Breadcrumb";
import { HiOutlineArrowRight, HiOutlinePlus } from "react-icons/hi";
import { FiBook, FiMessageCircle } from "react-icons/fi";
import { RiSave2Line } from "react-icons/ri";
import { motion } from "framer-motion";
import { cardContainer, cardItem } from "../motions/cardMotion";
import GlassSelect from "../components/Select";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";

export default function KnowledgeBasePage() {
  const [type, setType] = useState("");

  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Kho dữ liệu",
      path: "/dashboard/rag",
    },
    {
      label: "Collections",
    },
  ];
  return (
    <div className="mx-auto max-w-384 space-y-6">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Kho dữ liệu RAG Core
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
          <button className="from-primary to-primary/80 shadow-primary/30 flex items-center gap-2 rounded-lg bg-linear-to-br px-4 py-2 text-[13px] font-semibold text-white shadow-lg transition-all hover:scale-[1.03]">
            <FiPlus />
            Thêm Collection
          </button>
        </div>
      </div>
      <motion.div
        variants={cardContainer}
        initial="hidden"
        animate="show"
        className="my-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <DataSourceCard
          icon={<RiSave2Line className="text-xl" />}
          title="Tài liệu luật"
          description="Kho lưu trữ tuân thủ và hợp đồng"
          status={{ label: "Indexed", color: "green" }}
          documents="452 files"
        />

        <DataSourceCard
          icon={<FiBook className="text-xl" />}
          title="Technical Manuals"
          description="Sơ đồ mạch và hướng dẫn phần cứng"
          status={{ label: "Indexing 75%", color: "blue", progress: 75 }}
          documents="1,204 files"
          footerLeft={
            <span className="text-xs text-gray-500 italic dark:text-gray-400">
              Đang nạp...
            </span>
          }
        />

        <DataSourceCard
          icon={<FiMessageCircle className="text-xl" />}
          title="Hỗ trợ"
          description="Nhật ký trò chuyện và phiếu yêu cầu trước đây"
          status={{ label: "Inactive", color: "gray" }}
          documents="8,421 files"
          footerLeft={
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Paused 2 days ago
            </span>
          }
        />

        {/* Create New */}
        <a
          href="/dashboard/rag/new-collection"
          className="group hover:border-primary/50 hover:bg-primary/5 dark:border-border-dark flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-8 transition"
        >
          <div className="group-hover:bg-primary/10 group-hover:text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition dark:bg-white/5">
            <HiOutlinePlus className="text-3xl" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Thêm mới
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Thêm collection mới vào RAG Core
          </p>
        </a>
      </motion.div>
    </div>
  );
}

type DataSourceCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: {
    label: string;
    color: "green" | "blue" | "gray";
    progress?: number;
  };
  documents: string;
  active?: boolean;
  footerLeft?: React.ReactNode;
};

function DataSourceCard({
  icon,
  title,
  description,
  status,
  documents,
  footerLeft,
}: DataSourceCardProps) {
  const statusColor = {
    green:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-400",
  }[status.color];

  return (
    <motion.div
      variants={cardItem}
      className="group dark:border-border-dark relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white/80 backdrop-blur transition-all hover:shadow-xl dark:bg-white/5"
    >
      {/* Body */}
      <div className="relative space-y-5 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="bg-primary/10 text-primary ring-primary/20 flex h-11 w-11 items-center justify-center rounded-xl ring-1">
            {icon}
          </div>

          {/* Toggle */}
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" defaultChecked className="peer sr-only" />

            <div className="dark:bg-border-dark relative h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-emerald-500 after:absolute after:top-1 after:left-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>

        {/* Meta */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Trạng thái</span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusColor}`}
            >
              {status.label}
            </span>
          </div>

          {status.progress !== undefined && (
            <div className="dark:bg-border-dark h-1.5 w-full rounded-full bg-gray-200">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Số lượng</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {documents}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dark:border-border-dark relative mt-auto flex items-center justify-between border-t border-gray-100 bg-gray-50/60 px-6 py-4 dark:bg-white/5">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {footerLeft}
        </div>

        <button className="text-primary flex items-center gap-1 text-sm font-medium transition hover:gap-2">
          View details
          <HiOutlineArrowRight className="text-base" />
        </button>
      </div>
    </motion.div>
  );
}
