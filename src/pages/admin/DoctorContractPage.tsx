import { FiEye, FiAward, FiStar, FiMail, FiPhone } from "react-icons/fi";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import IconAction from "@/components/custom-ui/IconAction";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import { useClientPagination } from "@/hooks/useClientPagination";

// MOCK DATA
const mockContracts = [
  {
    id: "CTR-2026-001",
    doctorName: "BS. Nguyễn Trí Trường",
    specialty: "Tim Mạch",
    experience: "10 Năm",
    rating: 4.8,
    phone: "0901234567",
    email: "truongnt@medimate.com",
    submitDate: "15/03/2026",
    status: "active", // active, terminated
  },
  {
    id: "CTR-2026-002",
    doctorName: "BS. Trần Thanh Tâm",
    specialty: "Da Liễu",
    experience: "5 Năm",
    rating: 4.5,
    phone: "0918765432",
    email: "tamtt@medimate.com",
    submitDate: "12/03/2026",
    status: "active",
  },
  {
    id: "CTR-2026-003",
    doctorName: "BS. Lê Phương Trinh",
    specialty: "Nhi Khoa",
    experience: "12 Năm",
    rating: 4.9,
    phone: "0987123456",
    email: "trinhlp@medimate.com",
    submitDate: "05/01/2025",
    status: "terminated",
  },
];

type ColumnKey = "doctor" | "contact" | "contract" | "actions";

type TableColumn = {
  key: ColumnKey;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
};

const columns: TableColumn[] = [
  { key: "doctor", label: "Thông tin Bác sĩ", width: "w-[30%]" },
  { key: "contact", label: "Liên hệ", width: "w-[25%]" },
  { key: "contract", label: "Hợp đồng", width: "w-[30%]" },
  { key: "actions", label: "Thao tác", width: "w-[15%]", align: "center" },
];

export default function DoctorContractPage() {
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Bác sĩ", path: "/dashboard/doctors" },
    { label: "Hợp đồng Bác sĩ" },
  ];

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Lưu trữ Hợp đồng
          </h1>
        </div>
      </div>

      {/* Content - Data Table */}
      <div className="my-8">
        <ContractTable />
      </div>
    </div>
  );
}

function ContractTable() {
  // Simulate useQuery logic for data_handling_ui
  const isLoading = false;
  const isError = false;
  const data = mockContracts;
  const {
    page,
    pageSize,
    total,
    pagedData,
    handlePageChange,
    handlePageSizeChange,
  } = useClientPagination(data, { initialPageSize: 5 });

  return (
    <>
      <DataTableShell
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        isEmpty={data.length === 0}
        loadingMessage="Đang tải danh sách hợp đồng..."
        emptyTitle="Chưa có dữ liệu"
        emptyMessage="Không tìm thấy hợp đồng y tế nào vào lúc này."
        tbodyClassName="divide-y divide-gray-400 bg-white/50 dark:divide-border-dark dark:bg-transparent"
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      >
        {pagedData.map((row) => (
          <tr
            key={row.id}
            className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/5"
          >
                {/* 1. Thông tin bác sĩ */}
                <td className="border-r border-gray-400 p-4 dark:border-border-dark">
                  <div className="flex items-center gap-3">
                    <div className="from-primary/20 to-primary/5 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-sm font-bold shadow-inner">
                      {row.doctorName.charAt(4)}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="mb-0.5 truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {row.doctorName}
                      </span>
                      <span className="text-primary mb-1 truncate text-[12px] font-medium">
                        {row.specialty}
                      </span>
                      <div className="flex gap-2 text-[10px]">
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <FiAward className="text-amber-500" />{" "}
                          {row.experience}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <FiStar className="text-yellow-400" /> {row.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. Contact Info */}
                <td className="border-r border-gray-400 p-4 dark:border-border-dark">
                  <div className="flex flex-col space-y-2 text-xs">
                    <p className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <FiPhone className="text-gray-400" /> {row.phone}
                    </p>
                    <p
                      className="pointer-events-auto flex items-center gap-1.5 truncate text-gray-600 dark:text-gray-300"
                      title={row.email}
                    >
                      <FiMail className="text-gray-400" /> {row.email}
                    </p>
                  </div>
                </td>

                {/* 3. Contract Info & Status */}
                <td className="border-r border-gray-400 p-4 dark:border-border-dark">
                  <div className="flex flex-col text-xs">
                    <p className="mb-1 text-gray-500 dark:text-gray-400">
                      Ký ngày:{" "}
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {row.submitDate}
                      </span>
                    </p>
                    <p className="mb-2 text-gray-500 dark:text-gray-400">
                      Mã HĐ:{" "}
                      <span className="font-monospace text-gray-800 dark:text-gray-200">
                        {row.id}
                      </span>
                    </p>
                    <div className="mt-1 w-fit">
                      {row.status === "active" ? (
                        <Badge type="success" value="Đang hiệu lực" />
                      ) : (
                        <Badge type="error" value="Đã chấm dứt" />
                      )}
                    </div>
                  </div>
                </td>

                {/* 4. Thao tác */}
                <td className="p-4 text-center">
                  <Tooltip content="Mở trình xem Hợp Đồng gốc">
                    <IconAction
                      icon={<FiEye />}
                      className="text-primary hover:text-primary dark:text-primary dark:hover:text-primary-light"
                    />
                  </Tooltip>
                </td>
          </tr>
        ))}
      </DataTableShell>
    </>
  );
}
