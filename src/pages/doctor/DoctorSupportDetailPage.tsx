import { Badge } from "@/components/custom-ui/Badge";
import { formatDate } from "@/common/format";
import { getGenderDisplay } from "@/common/mappers";
import { useAppointmentDetail } from "@/hooks/data/useAppointmentHooks";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { FiCalendar, FiClock } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

type DoctorSupportDetailPageProps = {
	open: boolean;
	appointmentId: string | null;
	onClose: () => void;
};

function statusLabel(status: string) {
	const normalized = status.trim().toLowerCase();

	if (normalized === "pending") return "Chờ duyệt";
	if (normalized === "approved") return "Đã duyệt";
	if (normalized === "inprogress") return "Đang khám";
	if (normalized === "completed") return "Hoàn thành";
	if (normalized === "cancelled") return "Đã hủy";
	if (normalized === "rejected") return "Đã từ chối";
	return status || "Không xác định";
}

function getStatusBadge(status: string) {
	const normalized = status.trim().toLowerCase();

	if (normalized === "approved" || normalized === "completed") {
		return <Badge type="success" value={statusLabel(status)} />;
	}

	if (normalized === "pending" || normalized === "inprogress") {
		return <Badge type="warning" value={statusLabel(status)} />;
	}

	if (normalized === "cancelled" || normalized === "rejected") {
		return <Badge type="error" value={statusLabel(status)} />;
	}

	return <Badge type="info" value={statusLabel(status)} />;
}

function formatDateTime(value?: string | null) {
	if (!value) return "Chưa cập nhật";

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return `${formatDate(value)} ${date.toLocaleTimeString("vi-VN", {
		hour: "2-digit",
		minute: "2-digit",
	})}`;
}

function formatDateOfBirth(value?: string | null) {
	if (!value) return "Chưa cập nhật";

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return date.toLocaleDateString("vi-VN");
}

function toShortId(value?: string | null, length = 8) {
	if (!value) return "N/A";
	return value.replace(/-/g, "").toUpperCase().slice(0, length);
}

function getInitials(name?: string | null) {
	if (!name) return "?";

	const parts = name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2);

	return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

function Avatar({
	name,
	src,
}: {
	name?: string | null;
	src?: string | null;
}) {
	if (src) {
		return (
			<img
				src={src}
				alt={name || "avatar"}
				className="h-16 w-16 rounded-2xl object-cover"
			/>
		);
	}

	return (
		<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-semibold text-white">
			{getInitials(name)}
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
			<span className="text-xs font-medium uppercase tracking-wide text-gray-400">
				{label}
			</span>
			<span className="text-right text-sm font-medium text-white">{value}</span>
		</div>
	);
}

export function DoctorSupportDetailPage({
	open,
	appointmentId,
	onClose,
}: DoctorSupportDetailPageProps) {
	const { data, isLoading, isError, error, refetch } = useAppointmentDetail(
		appointmentId || "",
		open,
	);

	useEffect(() => {
		function handleEscape(event: KeyboardEvent) {
			if (event.key === "Escape") {
				onClose();
			}
		}

		if (open) {
			window.addEventListener("keydown", handleEscape);
		}

		return () => window.removeEventListener("keydown", handleEscape);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
				<div className="absolute inset-0" onClick={onClose} />

				<motion.div
					data-lenis-prevent
					initial={{ opacity: 0, scale: 0.95, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 10 }}
					onClick={(event) => event.stopPropagation()}
					  className="z-10 flex h-[90vh] min-h-0 max-h-215 w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 shadow-2xl backdrop-blur-xl"
				>
					<div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4 md:px-6">
						<div>
							<h2 className="text-lg font-semibold text-white">
								Chi tiết lịch hẹn
							</h2>
						</div>
						<button
							onClick={onClose}
							className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
						>
							<HiOutlineX className="h-5 w-5" />
						</button>
					</div>

					<div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
						{isLoading ? (
							<DetailSkeleton />
						) : isError ? (
							  <div className="flex min-h-90 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
								<h3 className="text-lg font-semibold text-white">
									Không thể tải chi tiết
								</h3>
								<p className="mt-2 max-w-md text-sm text-gray-400">
									{error?.message ||
										"Đã xảy ra lỗi khi tải thông tin lịch hẹn. Vui lòng thử lại."}
								</p>
								<button
									type="button"
									onClick={() => void refetch()}
									className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
								>
									Thử lại
								</button>
							</div>
						) : data ? (
							<div className="space-y-4">
								<section className="rounded-2xl border border-white/10 bg-white/5 p-5">
									<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
										<div className="flex items-start gap-4">
											<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
												<FiCalendar className="h-6 w-6" />
											</div>
											<div>
												<h3 className="mt-1 text-xl font-semibold text-white">
													Lịch hẹn khám bệnh
												</h3>
												<div className="mt-3 flex flex-wrap items-center gap-2">
													<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-gray-300">
														Mã lịch #{toShortId(data.appointmentId)}
													</span>
													{getStatusBadge(data.status)}
													<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-gray-300">
														Tạo lúc {formatDateTime(data.createdAt)}
													</span>
												</div>
											</div>
										</div>

										<div className="grid gap-2 text-sm text-gray-300 md:text-right">
											<div className="flex items-center gap-2 md:justify-end">
												<FiClock className="text-gray-400" />
												<span>{formatDateTime(data.appointmentDate)}</span>
											</div>
											<p className="text-xs text-gray-500">
												Giờ hẹn: {data.appointmentTime || "Chưa cập nhật"}
											</p>
										</div>
									</div>

									{data.cancelReason?.trim() ? (
										<div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
											<p className="text-xs font-semibold uppercase tracking-wide text-yellow-300">
												Lý do hủy / ghi chú
											</p>
											<p className="mt-2 text-sm text-yellow-50/90">
												{data.cancelReason}
											</p>
										</div>
									) : null}
								</section>

								<div className="grid gap-4 xl:grid-cols-2">
									<section className="rounded-2xl border border-white/10 bg-white/5 p-5">
										<div className="flex items-center gap-3">
											<Avatar name={data.doctorName} src={data.doctorAvatar} />
											<div>
												<p className="text-xs uppercase tracking-[0.2em] text-gray-400">
													Bác sĩ
												</p>
												<h3 className="mt-1 text-lg font-semibold text-white">
													{data.doctorName}
												</h3>
											</div>
										</div>

										<div className="mt-4 space-y-3">
											<InfoRow
												label="Chuyên khoa"
												value={data.specialty || "Chưa cập nhật"}
											/>
										</div>
									</section>

									<section className="rounded-2xl border border-white/10 bg-white/5 p-5">
										<div className="flex items-center gap-3">
											<Avatar name={data.memberName} src={data.memberAvatar} />
											<div>
												<p className="text-xs uppercase tracking-[0.2em] text-gray-400">
													Bệnh nhân
												</p>
												<h3 className="mt-1 text-lg font-semibold text-white">
													{data.memberName}
												</h3>
												<p className="text-sm text-gray-400">
													{getGenderDisplay(data.memberGender)}
												</p>
											</div>
										</div>

										<div className="mt-4 space-y-3">
											<InfoRow
												label="Mã bệnh nhân"
												value={`#${toShortId(data.memberId)}`}
											/>
											<InfoRow
												label="Ngày sinh"
												value={formatDateOfBirth(data.memberDateOfBirth)}
											/>
										</div>
									</section>
								</div>
							</div>
						) : (
							  <div className="flex min-h-90 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
								<h3 className="text-lg font-semibold text-white">
									Chưa có dữ liệu
								</h3>
								<p className="mt-2 max-w-md text-sm text-gray-400">
									Không tìm thấy thông tin chi tiết cho lịch hẹn này.
								</p>
							</div>
						)}
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}

function DetailSkeleton() {
	return (
		<div className="space-y-4">
			<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
				<div className="flex items-start gap-4">
					<div className="h-14 w-14 animate-pulse rounded-2xl bg-white/10" />
					<div className="flex-1 space-y-3">
						<div className="h-4 w-40 animate-pulse rounded bg-white/10" />
						<div className="h-8 w-72 animate-pulse rounded bg-white/10" />
						<div className="h-5 w-52 animate-pulse rounded bg-white/10" />
					</div>
				</div>
				<div className="mt-4 h-20 animate-pulse rounded-xl bg-white/10" />
			</div>

			<div className="grid gap-4 xl:grid-cols-2">
				{[0, 1].map((item) => (
					<div
						key={item}
						className="rounded-2xl border border-white/10 bg-white/5 p-5"
					>
						<div className="flex items-center gap-3">
							<div className="h-16 w-16 animate-pulse rounded-2xl bg-white/10" />
							<div className="flex-1 space-y-3">
								<div className="h-4 w-24 animate-pulse rounded bg-white/10" />
								<div className="h-6 w-40 animate-pulse rounded bg-white/10" />
								<div className="h-4 w-32 animate-pulse rounded bg-white/10" />
							</div>
						</div>
						<div className="mt-4 space-y-3">
							<div className="h-12 animate-pulse rounded-xl bg-white/10" />
							<div className="h-12 animate-pulse rounded-xl bg-white/10" />
						</div>
					</div>
				))}
			</div>

			<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
				<div className="h-5 w-40 animate-pulse rounded bg-white/10" />
				<div className="mt-3 h-20 animate-pulse rounded-xl bg-white/10" />
			</div>
		</div>
	);
}
