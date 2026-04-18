/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import {
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineStar,
  HiArrowTrendingUp,
  HiOutlineChartBar,
} from "react-icons/hi2";
import { HiChevronDown } from "react-icons/hi";
import { MdOutlineShowChart } from "react-icons/md";
import { dashboardContainer, dashboardItem } from "../motions/dashboardMotion";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
);
export default function SummaryDashboardPage() {

  const donutData = {
    labels: ["Chờ nạp", "Đang nạp", "Đã nạp"],
    datasets: [
      {
        data: [12, 84, 156],
        backgroundColor: ["#f97316", "#8b5cf6", "#22c55e"],
        borderWidth: 0,
      },
    ],
  };

  const donutOptions = {
    cutout: "70%",
    plugins: {
      legend: { display: false },
    },
  };

  const barData = {
    labels: ["Mo", "Tu", "We", "Th", "Fr", "Sa"],
    datasets: [
      {
        data: [65, 45, 30, 80, 55, 75],
        backgroundColor: "#EC4899",
        borderRadius: 6,
        maxBarThickness: 36,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280" },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.05)", borderDash: [4, 4] },
        ticks: { display: false },
      },
    },
  };

  const lineData = {
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    datasets: [
      {
        label: "Đang nạp",
        data: [120, 190, 170, 260, 240, 300, 280],
        borderColor: "#a855f7", // purple
        backgroundColor: "rgba(168,85,247,0.15)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
      {
        label: "Đã nạp",
        data: [80, 140, 130, 200, 190, 220, 210],
        borderColor: "#22c55e", // green
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: "Thất bại",
        data: [20, 40, 35, 60, 50, 70, 65],
        borderColor: "#f97316", // orange
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="page-layout">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-1 text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Thứ 6 · 21 Tháng 6
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Tổng quan hệ thống
          </h1>
        </div>
      </div>

      <motion.div
        variants={dashboardContainer}
        initial="hidden"
        animate="show"
        className="my-6 grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <motion.div
          variants={dashboardItem}
          className="rounded-xl border border-gray-400 bg-white p-6 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <HiOutlineDocumentText className="text-lg" />
              <span>Tổng số tài liệu</span>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <HiArrowTrendingUp />
              12%
            </span>
          </div>

          <h3 className="text-3xl font-semibold text-gray-900 dark:text-white tabular-nums">
            12,842
          </h3>

          <div className="mt-3 space-y-1 text-xs text-gray-500">
            <p>+1,372 tài liệu được thêm</p>
            <p>
              Cập nhật cuối <span className="text-gray-400">2 tiếng trước</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={dashboardItem}
          className="rounded-xl border border-gray-400 bg-white p-6 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <HiOutlineUsers className="text-lg" />
              <span>Tài khoản hoạt động</span>
            </div>
            <span className="text-xs text-gray-500">Hôm nay</span>
          </div>

          <h3 className="text-3xl font-semibold text-gray-900 dark:text-white tabular-nums">
            3,105
          </h3>

          <div className="mt-3 space-y-1 text-xs text-gray-500">
            <p>
              <span className="text-emerald-400">942</span> đang online
            </p>
            <p>Giờ cao điểm: 1,204 người dùng</p>
          </div>
        </motion.div>

        <motion.div
          variants={dashboardItem}
          className="rounded-xl border border-gray-400 bg-white p-6 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <HiOutlineStar className="text-lg" />
              <span>Mức độ hài lòng</span>
            </div>
            <span className="text-xs text-gray-500">30 ngày</span>
          </div>

          <h3 className="text-3xl font-semibold text-gray-900 dark:text-white">
            4.8<span className="text-base text-gray-500"> / 5</span>
          </h3>

          <div className="mt-3 space-y-2">
            <div className="h-1 w-full rounded-full bg-gray-100 dark:bg-white/10">
              <div className="h-full w-[92%] rounded-full bg-gray-400 dark:bg-white/40" />
            </div>

            <p className="text-xs text-gray-500">
              Dựa trên <span className="text-gray-400">1,248</span> phản hồi
            </p>
          </div>
        </motion.div>
      </motion.div>
      <motion.div
        variants={dashboardContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <motion.div
          variants={dashboardItem}
          className="rounded-xl border border-gray-400 bg-white p-6 dark:border-white/10 dark:bg-white/5 lg:col-span-1"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nạp tài liệu</h3>

            <button className="flex items-center gap-1 rounded-md border border-gray-400 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5">
              Tuần này
              <HiChevronDown className="text-sm" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="relative h-40 w-40">
              <Doughnut data={donutData} options={donutOptions} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold text-gray-900 dark:text-white">85%</span>
                <span className="text-[10px] tracking-wide text-gray-500 uppercase">
                  Thành công
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="font-medium text-gray-900 dark:text-white">12</span>
                <span className="text-gray-500 dark:text-gray-400">Chờ nạp</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="font-medium text-gray-900 dark:text-white">84</span>
                <span className="text-gray-500 dark:text-gray-400">Đang nạp</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="font-medium text-gray-900 dark:text-white">156</span>
                <span className="text-gray-500 dark:text-gray-400">Đã nạp</span>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          variants={dashboardItem}
          className="rounded-xl border border-gray-400 bg-white p-6 dark:border-white/10 dark:bg-white/5 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Lưu lượng nhúng</p>
              <h3 className="text-3xl font-semibold text-gray-900 dark:text-white">2.4k Docs</h3>
            </div>

            <button className="flex items-center gap-1 rounded-md border border-gray-400 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5">
              Tuần này
              <HiChevronDown className="text-sm" />
            </button>
          </div>

          <div className="h-44">
            <Bar data={barData} options={barOptions} />
          </div>
        </motion.div>
      </motion.div>
      <motion.div
        variants={dashboardContainer}
        initial="hidden"
        animate="show"
        className=""
      >
        <motion.div
          variants={dashboardItem}
          className="rounded-xl border border-gray-400 bg-white p-6 transition-colors dark:border-white/10 dark:bg-white/5"
        >
          {/* Header */}
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-16">
              <div>
                <p className="mb-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Lưu lượng hoạt động
                </p>
                <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  1.2 TB
                  <span className="ml-1 text-base font-normal text-gray-500 dark:text-gray-400">
                    /mo
                  </span>
                </h3>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Số lượng hành động
                </p>
                <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  24.5k
                </h3>
              </div>
            </div>

            {/* Chart type switch */}
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-white/5">
              <button className="bg-primary flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-sm">
                <MdOutlineShowChart className="text-sm" />
                Line
              </button>
              <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-white/10 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white">
                <HiOutlineChartBar className="text-sm" />
                Bar
              </button>
            </div>
          </div>

          {/* Metrics */}
          <motion.div
            variants={dashboardItem}
            className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            {/* <span className="text-xs font-medium tracking-widest text-gray-500 uppercase">
            Metrics
          </span> */}

            <div className="flex flex-wrap gap-6">
              <button className="relative pb-1 text-xs font-semibold text-gray-900 dark:text-white">
                Tất cả
                <span className="bg-primary absolute bottom-0 left-0 h-0.5 w-full" />
              </button>

              <button className="flex items-center gap-2 text-xs font-medium text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Chờ nạp
              </button>

              <button className="flex items-center gap-2 text-xs font-medium text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Đã nạp
              </button>

              <button className="flex items-center gap-2 text-xs font-medium text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                Thất bại
              </button>
            </div>
          </motion.div>

          {/* Chart */}
          <div className="relative h-64 w-full">
            <Line data={lineData} options={lineOptions} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
