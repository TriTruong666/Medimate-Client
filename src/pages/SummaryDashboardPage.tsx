import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineStar,
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineCash
} from 'react-icons/hi'; // hi vs hi2
import { dashboardContainer, dashboardItem } from '../motions/dashboardMotion';
import clsx from 'clsx';


import { getUsers } from '@/apis/user.service';
import { getDocumentList } from '@/apis/rag_document.service';
import { getDoctorCertificates, getPrescriptionImages } from '@/apis/asset.service';
import { getDoctorContracts } from '@/apis/doctor-contract.service';
import { getTransactions } from '@/apis/transaction.service';
import { getRatings } from '@/apis/rating.service';

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

  const metrics = [
    { label: "Tổng người dùng", value: usersData?.data?.totalCount ?? 0, isLoading: isUsersLoad, icon: HiOutlineUsers, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Tổng số Bác sĩ", value: doctorsData?.data?.totalCount ?? 0, isLoading: isDoctorsLoad, icon: HiOutlineUsers, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Đang hoạt động", value: activeUsersData?.data?.totalCount ?? 0, isLoading: isActiveUsersLoad, icon: HiOutlineUsers, color: "text-purple-500", bg: "bg-purple-500/10" },

    { label: "Tài liệu mạng RAG", value: ragData?.data?.pagination?.total_records ?? 0, isLoading: isRagLoad, icon: HiOutlineChartBar, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Bằng cấp Bác sĩ", value: certsData?.data?.totalCount ?? 0, isLoading: isCertsLoad, icon: HiOutlineClipboardList, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "Kê đơn (Hình ảnh)", value: prescriptionsData?.data?.totalCount ?? 0, isLoading: isPrescLoad, icon: HiOutlineDocumentText, color: "text-yellow-500", bg: "bg-yellow-500/10" },

    { label: "Hợp đồng Bác sĩ", value: contractsData?.data?.length ?? 0, isLoading: isContractsLoad, icon: HiOutlineClipboardList, color: "text-teal-500", bg: "bg-teal-500/10" },
    { label: "Tổng số Giao dịch", value: transactionsData?.data?.totalCount ?? 0, isLoading: isTransLoad, icon: HiOutlineCash, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Tổng lượt Đánh giá", value: ratingsData?.data?.totalCount ?? 0, isLoading: isRatingsLoad, icon: HiOutlineStar, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="page-layout">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-1 text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
            {currentDate}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Tổng quan hệ thống
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Dữ liệu trực tiếp (Live statistics) từ hệ thống Medimate. Mọi dữ liệu được tính tổng tới thời điểm hiện tại.
          </p>
        </div>
      </div>

      <motion.div
        variants={dashboardContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            variants={dashboardItem}
            className="flex flex-col justify-between rounded-xl border border-gray-400 bg-white p-6 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className={clsx("flex h-10 w-10 items-center justify-center rounded-lg", metric.bg, metric.color)}>
                <metric.icon className="text-xl" />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {metric.label}
              </span>
            </div>

            <div className="mt-2">
              {metric.isLoading ? (
                <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
              ) : (
                <h3 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white tabular-nums drop-shadow-sm">
                  {metric.value.toLocaleString()}
                </h3>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
