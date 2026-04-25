import type { BasePaginatedResponse, BaseResponse } from "@/types/APIResponse";
import { axiosNETClient } from "./client";
import { cleanQueryParams } from "@/common/query.params";

export type PayoutItemDto = {
  payoutId: string;
  clinicId: string | null;
  clinicName: string;
  appointmentId: string | null;
  appointmentDate: string | null;
  appointmentTime: string | null;
  patientName: string | null;
  doctorName: string | null;

  paymentStatus: string | null;
  payerName: string | null;
  payerPhoneNumber: string | null;
  payerBankName: string | null;
  payerBankAccountNumber: string | null;
  payerBankAccountHolder: string | null;
  consultationId: string | null;

  amount: number;
  status: "Hold" | "ReadyToPay" | "Paid" | "Cancelled";
  calculatedAt: string;
  paidAt: string | null;
  transferImageUrl: string | null;
  reportFileUrl: string | null;
};

export type PayoutSummaryDto = {
  clinicId: string;
  clinicName: string;
  totalPendingAmount: number;
  pendingPayoutCount: number;
  totalPaidAmount: number;
};

export type PayoutFilterDto = {
  clinicId?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
};

export type ProcessPayoutDto = {
  transferImage?: File | null;
  reportFile?: File | null;
  note?: string;
};

export async function getPayouts(
  params: PayoutFilterDto,
): Promise<BasePaginatedResponse<PayoutItemDto[]>> {
  const res = await axiosNETClient.get("/api/v1/payouts", {
    params: cleanQueryParams<PayoutFilterDto>(params),
  });
  return res.data;
}

export async function getPayoutSummary(): Promise<
  BaseResponse<PayoutSummaryDto[]>
> {
  const res = await axiosNETClient.get("/api/v1/payouts/summary");
  return res.data;
}

export async function processPayout(
  clinicId: string,
  payload: ProcessPayoutDto,
): Promise<BaseResponse<any>> {
  const formData = new FormData();

  if (payload.transferImage) {
    formData.append("TransferImage", payload.transferImage);
  }
  if (payload.reportFile) {
    formData.append("ReportFile", payload.reportFile);
  }
  if (payload.note) {
    formData.append("Note", payload.note);
  }

  const res = await axiosNETClient.post(
    `/api/v1/payouts/clinics/${clinicId}/process`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
}
