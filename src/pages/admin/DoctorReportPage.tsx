import { motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiTrash2,
  FiMessageCircle,
  FiMinusCircle,
} from "react-icons/fi";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { cardContainer, cardItem } from "@/motions/cardMotion";
import { formatRelativeTime } from "@/common/format";

// MOCK DATA
const dummyReports = [
  {
    id: "REP-2026-001",
    patientName: "Trần Văn Khang",
    doctorName: "BS. Nguyễn Trí Trường",
    reason:
      "Thái độ không tốt, tư vấn rất hời hợt và có lời lẽ không hay với bệnh nhân trong phiên khám bệnh lúc 14:00.",
    rating: 1,
    evidenceImages: [
      "https://images.unsplash.com/photo-1516382799247-87df95d790b7?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=200&auto=format&fit=crop",
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: "pending", // pending, warned, penalized, ignored
  },
  {
    id: "REP-2026-002",
    patientName: "Lê Phương Thảo",
    doctorName: "BS. Trần Thanh Tâm",
    reason:
      "Bác sĩ cho đơn thuốc nhưng không dặn dò kỹ liều lượng, hỏi lại trên app thì không thèm trả lời.",
    rating: 2,
    evidenceImages: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    status: "warned",
  },
];

export default function DoctorReportPage() {
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Bác sĩ", path: "/dashboard/doctors" },
    { label: "Báo cáo & Phản hồi" },
  ];

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

      {/* Feed Layout */}
      <motion.div
        variants={cardContainer}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6 pb-10"
      >
        {dummyReports.map((report) => (
          <ReportCard key={report.id} data={report} />
        ))}
      </motion.div>
    </div>
  );
}

function ReportCard({ data }: { data: (typeof dummyReports)[0] }) {
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-500/20 to-purple-500/20 font-bold text-indigo-500">
            {data.patientName.charAt(0)}
          </div>
          <div>
            <h4 className="mb-1 leading-none font-semibold text-gray-900 dark:text-gray-100">
              {data.patientName}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Báo cáo vi phạm cho{" "}
              <span className="text-primary font-semibold">
                {data.doctorName}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="mb-1 text-xs text-gray-400">
            {formatRelativeTime(data.timestamp)}
          </span>
          {data.status === "pending" ? (
            <Badge type="warning" value="Chờ xử lý" />
          ) : data.status === "warned" ? (
            <Badge type="info" value="Đã cảnh cáo" />
          ) : data.status === "penalized" ? (
            <Badge type="error" value="Đã phạt / Giam lương" />
          ) : (
            <Badge type="success" value="Đã bỏ qua" />
          )}
        </div>
      </div>

      {/* Body: Feedback Content */}
      <div className="pl-13">
        {/* Rating */}
        <div className="mb-2 flex items-center gap-1">
          {renderStars(data.rating)}
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:bg-white/10 dark:text-gray-400">
            {data.rating}/5 Điểm
          </span>
        </div>

        {/* Reason */}
        <div className="mb-4 rounded-r-lg border-l-2 border-red-400 bg-red-50/50 p-3 dark:bg-red-500/5">
          <p className="text-sm text-gray-700 italic dark:text-gray-300">
            "{data.reason}"
          </p>
        </div>

        {/* Evidence Images */}
        {data.evidenceImages && data.evidenceImages.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Hình ảnh bằng chứng
            </p>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
              {data.evidenceImages.map((img, i) => (
                <div
                  key={i}
                  className="hover:border-primary/50 relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-200 transition dark:border-white/10"
                >
                  <img
                    src={img}
                    alt={`Bằng chứng ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/20" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions (Admin Only) */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 dark:border-white/5">
          <button className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-4 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-500/20 dark:text-orange-400">
            <FiAlertTriangle /> Gửi Cảnh Cáo
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-500/20 dark:text-red-400">
            <FiMinusCircle /> Giam Lương / Phạt
          </button>
          <div className="flex-1" /> {/* Spacer */}
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5">
            <FiMessageCircle /> Nhắn tin bác sĩ
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:border-white/10 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-gray-300">
            <FiTrash2 /> Bỏ qua
          </button>
        </div>
      </div>
    </motion.div>
  );
}
