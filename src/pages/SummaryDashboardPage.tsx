import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  HiOutlineDocumentText, 
  HiOutlineUsers, 
  HiOutlineStar, 
  HiOutlineChartBar,
  HiOutlineArrowTrendingUp
} from 'react-icons/hi2';
import { 
  HiOutlineClipboardList,
  HiOutlineCash
} from 'react-icons/hi';
import { dashboardContainer, dashboardItem } from '../motions/dashboardMotion';
import clsx from 'clsx';

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
  Filler
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

import { getUsers } from '@/apis/user.service';
import { getDocumentList } from '@/apis/rag_document.service';
import { getDoctorCertificates, getPrescriptionImages } from '@/apis/asset.service';
import { getDoctorContracts } from '@/apis/doctor-contract.service';
import { getTransactions } from '@/apis/transaction.service';
import { getRatings } from '@/apis/rating.service';

ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler
);

export default function SummaryDashboardPage() {
  const { data: usersData, isLoading: isUsersLoad } = useQuery({ 
    queryKey: ["admin-summary", "users"], 
    queryFn: () => getUsers({ pageNumber: 1, pageSize: 1 }) 
  });
  const { data: doctorsData, isLoading: isDoctorsLoad } = useQuery({ 
    queryKey: ["admin-summary", "doctors"], 
    queryFn: () => getUsers({ pageNumber: 1, pageSize: 1, role: "Doctor" } as any) 
  });
  const { data: activeUsersData, isLoading: isActiveUsersLoad } = useQuery({ 
    queryKey: ["admin-summary", "active-users"], 
    queryFn: () => getUsers({ pageNumber: 1, pageSize: 1, isActive: true } as any) 
  });
  const { data: ragData, isLoading: isRagLoad } = useQuery({ 
    queryKey: ["admin-summary", "rag"], 
    queryFn: () => getDocumentList({ page: 1, limit: 1 }) 
  });
  const { data: certsData, isLoading: isCertsLoad } = useQuery({ 
    queryKey: ["admin-summary", "certs"], 
    queryFn: () => getDoctorCertificates({ pageNumber: 1, pageSize: 1 }) 
  });
  const { data: prescriptionsData, isLoading: isPrescLoad } = useQuery({ 
    queryKey: ["admin-summary", "prescriptions"], 
    queryFn: () => getPrescriptionImages({ pageNumber: 1, pageSize: 1 }) 
  });
  const { data: contractsData, isLoading: isContractsLoad } = useQuery({ 
    queryKey: ["admin-summary", "contracts"], 
    queryFn: () => getDoctorContracts() 
  });
  const { data: transactionsData, isLoading: isTransLoad } = useQuery({ 
    queryKey: ["admin-summary", "transactions"], 
    queryFn: () => getTransactions({ pageNumber: 1, pageSize: 1 }) 
  });
  const { data: ratingsData, isLoading: isRatingsLoad } = useQuery({ 
    queryKey: ["admin-summary", "ratings"], 
    queryFn: () => getRatings({ pageNumber: 1, pageSize: 1 }) 
  });

  const totalRag = ragData?.data?.pagination?.total_records ?? 0;
  const totalCerts = certsData?.data?.totalCount ?? 0;
  const totalPresc = prescriptionsData?.data?.totalCount ?? 0;

  const topMetrics = [
    { label: "Tổng người dùng", value: usersData?.data?.totalCount ?? 0, isLoading: isUsersLoad, icon: HiOutlineUsers, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+12%" },
    { label: "Bác sĩ tham gia", value: doctorsData?.data?.totalCount ?? 0, isLoading: isDoctorsLoad, icon: HiOutlineUsers, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+5%" },
    { label: "Hợp đồng ký kết", value: contractsData?.data?.length ?? 0, isLoading: isContractsLoad, icon: HiOutlineClipboardList, color: "text-purple-500", bg: "bg-purple-500/10", trend: "+8%" },
    { label: "Giao dịch nền tảng", value: transactionsData?.data?.totalCount ?? 0, isLoading: isTransLoad, icon: HiOutlineCash, color: "text-indigo-500", bg: "bg-indigo-500/10", trend: "+24%" },
  ];

  const secondaryMetrics = [
    { label: "Tài khoản đang HĐ", value: activeUsersData?.data?.totalCount ?? 0, isLoading: isActiveUsersLoad, icon: HiOutlineUsers, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Lượt đánh giá", value: ratingsData?.data?.totalCount ?? 0, isLoading: isRatingsLoad, icon: HiOutlineStar, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  const donutData = {
    labels: ["Tài liệu AI (RAG)", "Bằng cấp BS", "Đơn lưu trữ"],
    datasets: [
      {
        data: (totalRag === 0 && totalCerts === 0 && totalPresc === 0) 
            ? [1, 1, 1] 
            : [totalRag, totalCerts, totalPresc],
        backgroundColor: ["#f97316", "#8b5cf6", "#14b8a6"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const donutOptions = {
    cutout: "75%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            if (totalRag === 0 && totalCerts === 0 && totalPresc === 0) return " Chưa có dữ liệu";
            return ` ${context.label}: ${context.raw}`;
          }
        }
      }
    },
  };

  const lineData = {
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    datasets: [
      {
        label: "Lượt truy cập",
        data: [120, 190, 170, 260, 240, 300, 340],
        borderColor: "#3b82f6", 
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Phiên khám",
        data: [80, 140, 130, 200, 190, 220, 250],
        borderColor: "#10b981", 
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top' as const,
        labels: { usePointStyle: true, boxWidth: 8, color: "#9ca3af" }
      },
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#9ca3af" } },
      y: { grid: { color: "rgba(156, 163, 175, 0.1)" }, ticks: { color: "#9ca3af" } },
    },
  };

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-1.5 text-xs tracking-wider text-primary font-bold uppercase drop-shadow-sm">
            {currentDate}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl drop-shadow-md">
            Biểu đồ hoạt động
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Theo dõi chi tiết mức tăng trưởng, tài liệu và hoạt động trên hệ thống Medimate.
          </p>
        </div>
      </div>

      <motion.div
        variants={dashboardContainer}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6"
      >
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {topMetrics.map((metric, index) => (
            <motion.div
              key={index}
              variants={dashboardItem}
              className="flex flex-col justify-between rounded-2xl border border-gray-400 bg-white/60 p-6 backdrop-blur-xl transition-all hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={clsx("flex h-12 w-12 items-center justify-center rounded-xl", metric.bg, metric.color)}>
                  <metric.icon className="text-2xl" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <HiOutlineArrowTrendingUp />
                  {metric.trend}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  {metric.label}
                </p>
                {metric.isLoading ? (
                  <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10 mt-1" />
                ) : (
                  <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white tabular-nums">
                    {metric.value.toLocaleString()}
                  </h3>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Line Chart Section */}
          <motion.div
            variants={dashboardItem}
            className="rounded-2xl border border-gray-400 bg-white/60 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 lg:col-span-2"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tăng trưởng truy cập</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dữ liệu tham khảo (7 ngày qua)</p>
              </div>
            </div>
            <div className="relative h-64 w-full">
              <Line data={lineData} options={lineOptions} />
            </div>
          </motion.div>

          {/* Donut Chart Section */}
          <motion.div
            variants={dashboardItem}
            className="flex flex-col justify-between rounded-2xl border border-gray-400 bg-white/60 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 lg:col-span-1"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hệ sinh thái tài liệu</h3>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="relative h-44 w-44">
                <Doughnut data={donutData} options={donutOptions} />
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {isRagLoad || isCertsLoad || isPrescLoad ? (
                        <div className="h-8 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-white/10" />
                    ) : (
                        (totalRag + totalCerts + totalPresc).toLocaleString()
                    )}
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase mt-1">
                    Tệp tin
                  </span>
                </div>
              </div>

              {/* Legends */}
              <div className="mt-8 w-full space-y-3 px-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Tài liệu AI (RAG)</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{totalRag}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Bằng cấp BS</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{totalCerts}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#14b8a6]" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Đơn thuốc</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{totalPresc}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Secondary Metrics Row */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {secondaryMetrics.map((metric, index) => (
            <motion.div
              key={index}
              variants={dashboardItem}
              className="flex items-center justify-between rounded-2xl border border-gray-400 bg-white/60 p-5 backdrop-blur-xl transition-all hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <div className="flex items-center gap-4">
                <div className={clsx("flex h-12 w-12 items-center justify-center rounded-xl", metric.bg, metric.color)}>
                  <metric.icon className="text-2xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{metric.label}</p>
                </div>
              </div>
              <div className="text-right">
                {metric.isLoading ? (
                  <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
                ) : (
                  <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {metric.value.toLocaleString()}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
