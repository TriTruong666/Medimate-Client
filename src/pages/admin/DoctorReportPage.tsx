import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMessageCircle,
} from "react-icons/fi";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { cardContainer, cardItem } from "@/motions/cardMotion";
import { formatRelativeTime } from "@/common/format";
import { useRatings } from "@/hooks/data/useRatingHooks";
import type { Rating } from "@/apis/rating.service";

export default function DoctorReportPage() {
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Bác sĩ", path: "/dashboard/doctors" },
    { label: "Báo cáo & Phản hồi" },
  ];

  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useRatings({
    pageNumber: page,
    pageSize: 10,
  });

  const reports = data?.data?.items ?? [];

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Phản hồi về Bác sĩ
          </h1>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center p-8 text-white">Đang tải phản hồi...</div>
      )}

      {isError && (
        <div className="flex justify-center p-8 text-red-500">{(error as Error).message}</div>
      )}

      {/* Feed Layout */}
      {!isLoading && !isError && (
        <motion.div
          variants={cardContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6 pb-10"
        >
          {reports.length === 0 ? (
            <div className="flex justify-center p-8 text-gray-400">Không có phản hồi nào.</div>
          ) : (
            reports.map((report) => (
              <ReportCard key={report.ratingId} data={report} />
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}

function ReportCard({ data }: { data: Rating }) {
  // Render stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
      >
        ★
      </span>
    ));
  };

  return (
    <motion.div
      variants={cardItem}
      className="relative rounded-2xl border border-gray-100 bg-white/80 p-6 backdrop-blur transition-all hover:border-white/20 dark:border-white/10 dark:bg-white/5"
    >
      {/* Header: User & Meta */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar Patient */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 font-bold text-indigo-500">
            {data.memberName ? data.memberName.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <h4 className="mb-1 leading-none font-semibold text-gray-900 dark:text-gray-100">
              {data.memberName}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Đánh giá bác sĩ{" "}
              <span className="font-semibold text-primary">
                {data.doctorName}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="mb-1 text-xs text-gray-400">
            {formatRelativeTime(data.createdAt)}
          </span>
        </div>
      </div>

      {/* Body: Feedback Content */}
      <div className="pl-13">
        {/* Rating */}
        <div className="mb-2 flex items-center gap-1">
          {renderStars(data.score)}
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:bg-white/10 dark:text-gray-400">
            {data.score}/5 Điểm
          </span>
        </div>

        {/* Reason */}
        {data.comment && (
          <div className="mb-4 rounded-r-lg border-l-2 border-red-400 bg-red-50/50 p-3 dark:bg-red-500/5">
            <p className="text-sm text-gray-700 italic dark:text-gray-300">
              "{data.comment}"
            </p>
          </div>
        )}

        {/* Evidence Images */}
        {data.imageUrl && (
          <div className="mb-5">
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Hình ảnh bằng chứng
            </p>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
              <div className="relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-200 transition hover:border-primary/50 dark:border-white/10">
                <img
                  src={data.imageUrl}
                  alt="Bằng chứng"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 transition-colors bg-black/0 hover:bg-black/20" />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 dark:border-white/5">
          <div className="flex-1" />
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5">
            <FiMessageCircle /> Nhắn tin bác sĩ
          </button>
        </div>
      </div>
    </motion.div>
  );
}
