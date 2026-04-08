/* eslint-disable @typescript-eslint/no-unused-vars */
import { type ReactNode, useState } from "react";
import Breadcrumb from "../../components/custom-ui/Breadcrumb";
import { HiOutlineArrowRight, HiOutlinePlus } from "react-icons/hi";
import {  FiPlus, FiShield } from "react-icons/fi";

import { motion } from "framer-motion";
import { cardContainer, cardItem } from "../../motions/cardMotion";
import GlassSelect from "../../components/custom-ui/Select";
import Toggle from "@/components/custom-ui/Toggle";
import {
  useRAGCollections,
  useUpdateRAGCollection,
} from "@/hooks/data/useRAGCollectionHooks";
import { formatDate } from "@/common/format";

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

  const { data: collectionsRes, isLoading } = useRAGCollections({
    page: 1,
    limit: 100,
  });

  const collections = collectionsRes?.data?.items || [];
  return (
    <div className="page-layout">
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
          <a href="/dashboard/rag/new" className="btn-primary">
            <FiPlus />
            Thêm Collection
          </a>
        </div>
      </div>
      <motion.div
        variants={cardContainer}
        initial="hidden"
        animate="show"
        className="my-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-72 w-full animate-pulse rounded-2xl bg-white/5"
            />
          ))
        ) : (
          <>
            {collections.map((collection) => (
              <DataSourceCard
                key={collection.id}
                icon={<FiShield className="text-xl" />}
                title={collection.name}
                description={collection.description}
                status={{
                  label: collection.is_active ? "Hoạt động" : "Ngưng",
                  color: collection.is_active ? "green" : "gray",
                }}
                footerLeft={
                  <span className="text-xs text-gray-500 italic dark:text-gray-400">
                    Tạo: {formatDate(collection.created_at)}
                  </span>
                }
                collectionId={collection.id}
                isActive={collection.is_active}
              />
            ))}

            {/* Create New */}
            <a
              href="/dashboard/rag/new"
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
          </>
        )}
      </motion.div>
    </div>
  );
}

type DataSourceCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  status: {
    label: string;
    color: "green" | "blue" | "gray";
  };
  collectionId: string;
  isActive: boolean;
  footerLeft?: ReactNode;
};

function DataSourceCard({
  icon,
  title,
  description,
  status,
  collectionId,
  isActive,
  footerLeft,
}: DataSourceCardProps) {
  const { mutate: updateCollection, isPending } = useUpdateRAGCollection();

  const handleToggleActive = (checked: boolean) => {
    updateCollection({
      collectionId,
      data: { is_active: checked },
    });
  };
  const statusColor = {
    green:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-400",
  }[status.color];

  return (
    <motion.div
      variants={cardItem}
      className="group dark:border-border-dark relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white/80 backdrop-blur transition-all hover:border-white/20 hover:bg-white/10 dark:bg-white/5"
    >
      {/* Body */}
      <div className="relative space-y-5 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="bg-primary/10 text-primary ring-primary/20 flex h-11 w-11 items-center justify-center rounded-xl ring-1">
            {icon}
          </div>

          {/* Toggle */}
          <Toggle
            checked={isActive}
            onChange={handleToggleActive}
            disabled={isPending}
          />
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
        </div>
      </div>

      {/* Footer */}
      <div className="dark:border-border-dark relative mt-auto flex items-center justify-between border-t border-gray-100 bg-gray-50/60 px-6 py-4 dark:bg-white/5">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {footerLeft}
        </div>

        <a
          href={`/dashboard/rag/${collectionId}`}
          className="text-primary flex items-center gap-1 text-sm font-medium transition hover:gap-2"
        >
          Chi tiết
          <HiOutlineArrowRight className="text-base" />
        </a>
      </div>
    </motion.div>
  );
}
