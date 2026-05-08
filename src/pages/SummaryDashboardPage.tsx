import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiChevronDown,
  HiOutlineBadgeCheck,
  HiOutlineClipboardList,
} from "react-icons/hi";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { MdOutlineShowChart } from "react-icons/md";
import { dashboardContainer, dashboardItem } from "../motions/dashboardMotion";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import { Doughnut, Line, Bar } from "react-chartjs-2";

import { getUsers } from "@/apis/user.service";
import { getClinics } from "@/apis/clinic.service";
import { getDocumentList } from "@/apis/rag_document.service";
import {
  getDoctorCertificates,
  getPrescriptionImages,
} from "@/apis/asset.service";
import { getDoctorContracts } from "@/apis/doctor-contract.service";
import { getTransactions, getTransactionStatistics } from "@/apis/transaction.service";

ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
);

export default function SummaryDashboardPage() {
  const { data: allUsersData, isLoading: isUsersLoad } = useQuery({
    queryKey: ["admin-summary", "all-users"],
    queryFn: () => getUsers({ pageNumber: 1, pageSize: 1000 }),
  });

  const allUsersList = allUsersData?.data?.items || [];
  const totalUsersCount = allUsersList.filter(
    (u: any) => u.role === "User",
  ).length;
  const totalDoctorsCount = allUsersList.filter(
    (u: any) => u.role === "Doctor",
  ).length;
  const activeUsersCount = allUsersList.filter((u: any) => u.isActive).length;

  const { data: ragData, isLoading: isRagLoad } = useQuery({
    queryKey: ["admin-summary", "rag"],
    queryFn: () => getDocumentList({ page: 1, limit: 1 }),
  });
  const { data: certsData, isLoading: isCertsLoad } = useQuery({
    queryKey: ["admin-summary", "certs"],
    queryFn: () => getDoctorCertificates({ pageNumber: 1, pageSize: 1 }),
  });
  const { data: clinicsData, isLoading: isClinicsLoad } = useQuery({
    queryKey: ["admin-summary", "clinics"],
    queryFn: () => getClinics(),
  });
  const { data: prescriptionsData, isLoading: isPrescLoad } = useQuery({
    queryKey: ["admin-summary", "prescriptions"],
    queryFn: () => getPrescriptionImages({ pageNumber: 1, pageSize: 1 }),
  });
  useQuery({
    queryKey: ["admin-summary", "contracts"],
    queryFn: () => getDoctorContracts(),
  });
  const { data: transactionsData, isLoading: isTransLoad } = useQuery({
    queryKey: ["admin-summary", "transactions"],
    queryFn: () => getTransactions({ pageNumber: 1, pageSize: 1 }),
  });
  const { data: txStatsData, isLoading: isStatsLoad } = useQuery({
    queryKey: ["admin-summary", "tx-statistics"],
    queryFn: () => getTransactionStatistics(),
  });
  const totalRag = ragData?.data?.pagination?.total_records ?? 0;
  const totalCerts = certsData?.data?.totalCount ?? 0;
  const totalClinicsCount = clinicsData?.data?.length ?? 0;
  const activeClinicsCount = clinicsData?.data?.filter((clinic) => clinic.isActive).length ?? 0;
  const totalPresc = prescriptionsData?.data?.totalCount ?? 0;
  const totalTransactions = transactionsData?.data?.totalCount ?? 0;
  const clinicActivityRatio =
    totalClinicsCount > 0
      ? Math.max(35, Math.min(100, (activeClinicsCount / totalClinicsCount) * 100))
      : 35;

  const totalIncoming = txStatsData?.data?.totalIncoming ?? 0;
  const totalOutgoing = txStatsData?.data?.totalOutgoing ?? 0;
  const netRevenue = txStatsData?.data?.netRevenue ?? 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", notation: "compact", maximumFractionDigits: 1 }).format(val);

  const userRoleData = {
    labels: ["Khách hàng", "Bác sĩ"],
    datasets: [
      {
        data:
          totalUsersCount === 0 && totalDoctorsCount === 0
            ? [1, 1]
            : [totalUsersCount, totalDoctorsCount],
        backgroundColor: ["#8b5cf6", "#f97316"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const userRoleOptions = {
    cutout: "75%",
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const lineData = {
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    datasets: [
      {
        label: "Thu vào",
        data: [120, 190, 170, 260, 240, 300, 280],
        borderColor: "#a855f7",
        backgroundColor: "rgba(168, 85, 247, 0.15)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
      {
        label: "Chi ra",
        data: [80, 140, 130, 200, 190, 220, 210],
        borderColor: "#22c55e",
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: "Doanh thu thuần",
        data: [20, 40, 35, 60, 50, 70, 65],
        borderColor: "#f97316",
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const barData = {
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    datasets: [
      {
        label: "Thu vào",
        data: [120, 190, 170, 260, 240, 300, 280],
        backgroundColor: "rgba(168, 85, 247, 0.65)",
        borderColor: "#a855f7",
        borderWidth: 0,
        borderRadius: 4,
      },
      {
        label: "Chi ra",
        data: [80, 140, 130, 200, 190, 220, 210],
        backgroundColor: "rgba(34, 197, 94, 0.65)",
        borderColor: "#22c55e",
        borderWidth: 0,
        borderRadius: 4,
      },
      {
        label: "Doanh thu thuần",
        data: [20, 40, 35, 60, 50, 70, 65],
        backgroundColor: "rgba(249, 115, 22, 0.65)",
        borderColor: "#f97316",
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280", font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#6b7280", font: { size: 11 } },
      },
    },
  };


  const currentDate = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-1 text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
            {currentDate}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Tổng quan hệ thống
          </h1>
        </div>
      </div>

      {/* ── Top Metric Cards ── */}
      <motion.div
        variants={dashboardContainer}
        initial="hidden"
        animate="show"
        className="my-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div
          variants={dashboardItem}
          className="flex flex-col justify-between rounded-lg border border-gray-400 bg-white p-6 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <HiOutlineUsers className="text-lg" />
                <span>Người dùng hệ thống</span>
              </div>
              <span className="text-xs text-gray-500">Hôm nay</span>
            </div>

            {isUsersLoad ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
            ) : (
              <h3 className="text-3xl font-semibold tabular-nums text-gray-900 dark:text-white">
                {(totalUsersCount + totalDoctorsCount).toLocaleString()}
              </h3>
            )}
          </div>

          <div className="mt-4 space-y-1 text-xs text-gray-500">
            <p>
              <span className="text-emerald-400">{activeUsersCount}</span> đang online
            </p>
            <p>
              Bác sĩ chuyên môn: <span className="text-gray-400">{totalDoctorsCount}</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={dashboardItem}
          className="flex flex-col justify-between rounded-lg border border-gray-400 bg-white p-6 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <HiOutlineBadgeCheck className="text-lg" />
                <span>Phòng khám</span>
              </div>
              <span className="text-xs text-gray-500">Tổng số</span>
            </div>

            {isClinicsLoad ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
            ) : (
              <h3 className="text-3xl font-semibold tabular-nums text-gray-900 dark:text-white">
                {totalClinicsCount.toLocaleString()}
              </h3>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${clinicActivityRatio}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full bg-gray-400 dark:bg-white/40"
              />
            </div>
            <p className="text-xs text-gray-500">
              <span className="text-gray-400">
                {isClinicsLoad ? "..." : activeClinicsCount.toLocaleString()}
              </span>{" "}
              phòng khám đang hoạt động
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={dashboardItem}
          className="flex flex-col justify-between rounded-lg border border-gray-400 bg-white p-6 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <HiOutlineDocumentText className="text-lg" />
                <span>Tài liệu RAG</span>
              </div>
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <HiArrowTrendingUp />
                12%
              </span>
            </div>

            {isRagLoad ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
            ) : (
              <h3 className="text-3xl font-semibold tabular-nums text-gray-900 dark:text-white">
                {totalRag.toLocaleString()}
              </h3>
            )}
          </div>

          <div className="mt-4 space-y-1 text-xs text-gray-500">
            <p>Đã lập chỉ mục & nhúng Vector</p>
            <p>
              Cập nhật cuối <span className="text-gray-400">2 tiếng trước</span>
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col gap-6">
          <motion.div
            variants={dashboardItem}
            className="flex flex-1 items-center justify-between rounded-lg border border-gray-400 bg-white p-5 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <div>
              <p className="mb-1 text-[11px] font-medium tracking-wider text-gray-400 uppercase">
                Bằng cấp Bác sĩ
              </p>
              {isCertsLoad ? (
                <div className="h-7 w-16 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
              ) : (
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {totalCerts.toLocaleString()}
                </h3>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <HiOutlineBadgeCheck className="text-xl" />
            </div>
          </motion.div>

          <motion.div
            variants={dashboardItem}
            className="flex flex-1 items-center justify-between rounded-lg border border-gray-400 bg-white p-5 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <div>
              <p className="mb-1 text-[11px] font-medium tracking-wider text-gray-400 uppercase">
                Đơn thuốc Bệnh nhân
              </p>
              {isPrescLoad ? (
                <div className="h-7 w-16 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
              ) : (
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {totalPresc.toLocaleString()}
                </h3>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <HiOutlineClipboardList className="text-xl" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Middle Row: Donut + Line Chart ── */}
      <motion.div
        variants={dashboardContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        {/* Donut Chart */}
        <motion.div
          variants={dashboardItem}
          className="flex flex-col rounded-lg border border-gray-400 bg-white p-6 lg:col-span-1 dark:border-white/10 dark:bg-white/5"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-400">
              Cơ cấu người dùng
            </h3>
            <button className="flex items-center gap-1 rounded-md border border-gray-400 px-2 py-1 text-xs text-gray-400 transition hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/5">
              Toàn quyền
              <HiChevronDown className="text-sm" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-8 md:gap-10">
            <div className="relative h-44 w-44 md:h-52 md:w-52">
              <Doughnut data={userRoleData} options={userRoleOptions} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {(totalUsersCount + totalDoctorsCount).toLocaleString()}
                </span>
                <span className="mt-1 text-[10px] tracking-widest text-gray-500 uppercase">
                  Tổng tài khoản
                </span>
              </div>
            </div>

            <div className="flex w-full items-center justify-center gap-8 text-xs">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
                  <span className="text-gray-400">Khách hàng</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalUsersCount.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#f97316]" />
                  <span className="text-gray-400">Bác sĩ</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalDoctorsCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Line Chart */}
        <motion.div
          variants={dashboardItem}
          className="rounded-lg border border-gray-400 bg-white p-6 lg:col-span-2 dark:border-white/10 dark:bg-white/5"
        >
          {/* Chart Header */}
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-10">
              {/* Thu vào */}
              <div>
                <p className="mb-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Tổng thu vào
                </p>
                {isStatsLoad ? (
                  <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
                ) : (
                  <h3 className="text-3xl font-semibold tracking-tight tabular-nums text-gray-900 dark:text-white">
                    {formatCurrency(totalIncoming)}
                  </h3>
                )}
              </div>

              {/* Chi ra */}
              <div>
                <p className="mb-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Tổng chi ra
                </p>
                {isStatsLoad ? (
                  <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
                ) : (
                  <h3 className="text-3xl font-semibold tracking-tight tabular-nums text-gray-900 dark:text-white">
                    {formatCurrency(totalOutgoing)}
                  </h3>
                )}
              </div>

              {/* Doanh thu thuần */}
              <div>
                <p className="mb-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Doanh thu thuần
                </p>
                {isStatsLoad ? (
                  <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
                ) : (
                  <h3 className={`text-3xl font-semibold tracking-tight tabular-nums ${
                    netRevenue >= 0 ? "text-gray-900 dark:text-white" : "text-rose-500"
                  }`}>
                    {formatCurrency(netRevenue)}
                  </h3>
                )}
              </div>
            </div>

            {/* Chart type switch */}
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-white/5">
              <button
                onClick={() => setChartType("line")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  chartType === "line"
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <MdOutlineShowChart className="text-sm" />
                Line
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  chartType === "bar"
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <HiOutlineChartBar className="text-sm" />
                Bar
              </button>
            </div>
          </div>

          {/* Metrics filter / legend */}
          <div className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex flex-wrap gap-6">
              <button className="relative pb-1 text-xs font-semibold text-gray-900 dark:text-white">
                Tất cả
                <span className="bg-primary absolute bottom-0 left-0 h-0.5 w-full" />
              </button>
              <button className="flex items-center gap-2 text-xs font-medium text-gray-400 transition hover:text-gray-900 dark:hover:text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Thu vào
              </button>
              <button className="flex items-center gap-2 text-xs font-medium text-gray-400 transition hover:text-gray-900 dark:hover:text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Chi ra
              </button>
              <button className="flex items-center gap-2 text-xs font-medium text-gray-400 transition hover:text-gray-900 dark:hover:text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                Doanh thu thuần
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="relative h-64 w-full">
            {chartType === "bar" ? (
              <Bar data={barData} options={chartOptions} />
            ) : (
              <Line data={lineData} options={chartOptions} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
