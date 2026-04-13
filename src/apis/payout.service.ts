import type { BasePaginatedResponse, BaseResponse } from "@/types/APIResponse";
import { axiosNETClient } from "./client";
import { cleanQueryParams } from "@/common/query.params";

export type PendingPayout = {
  payoutId: string;
  doctorId: string;
  doctorName: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  calculatedAt: string;
  status: string;
};

export type PaidPayout = {
  payoutId: string;
  doctorId: string;
  doctorName: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  calculatedAt: string;
  paidAt: string | null;
  transferImageUrl: string | null;
  bankTransactionCode: string | null;
};

export type GetPayoutsParams = {
  pageNumber?: number;
  pageSize?: number;
};

export type ApprovePayoutPayload = {
  bankTransactionCode: string;
  transferImage?: File | null;
};

export async function getPendingPayouts(
  params: GetPayoutsParams,
): Promise<BasePaginatedResponse<PendingPayout[]>> {
  const res = await axiosNETClient.get("/api/v1/transactions/payouts/pending", {
    params: cleanQueryParams<GetPayoutsParams>({ ...params, pageSize: 10 }),
  });
  return res.data;
}

export async function getPaidPayouts(
  params: GetPayoutsParams,
): Promise<BasePaginatedResponse<PaidPayout[]>> {
  const res = await axiosNETClient.get("/api/v1/transactions/payouts/paid", {
    params: cleanQueryParams<GetPayoutsParams>({ ...params, pageSize: 10 }),
  });
  return res.data;
}

export async function approvePayout(
  payoutId: string,
  payload: ApprovePayoutPayload,
): Promise<BaseResponse<any>> {
  const formData = new FormData();
  formData.append("BankTransactionCode", payload.bankTransactionCode);
  
  if (payload.transferImage) {
    formData.append("TransferImage", payload.transferImage);
  }

  const res = await axiosNETClient.post(
    `/api/v1/transactions/payouts/${payoutId}/approve`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
}
