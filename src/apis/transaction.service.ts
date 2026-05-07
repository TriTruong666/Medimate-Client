import type { BasePaginatedResponse, BaseResponse } from "@/types/APIResponse";
import { cleanQueryParams } from "@/common/query.params";
import type {
  GetTransactionsParams,
  Transaction,
  TransactionDetail,
  TransactionStatistics,
} from "@/types/Transaction";
import { axiosNETClient } from "./client";

export async function getTransactions(
  params: GetTransactionsParams,
): Promise<BasePaginatedResponse<Transaction[]>> {
  const res = await axiosNETClient.get("/api/v1/transactions", {
    params: cleanQueryParams<GetTransactionsParams>({ ...params, pageSize: 10 }),
  });
  return res.data;
}

export async function getTransactionDetail(
  id: string,
): Promise<BaseResponse<TransactionDetail>> {
  const res = await axiosNETClient.get(`/api/v1/transactions/${id}`);
  return res.data;
}

export async function getUserTransactions(
  userId: string,
  params: GetTransactionsParams
): Promise<BasePaginatedResponse<Transaction[]>> {
  const res = await axiosNETClient.get(`/api/v1/transactions/user/${userId}`, {
    params: cleanQueryParams<GetTransactionsParams>({ ...params, pageSize: 10 }),
  });
  return res.data;
}

export async function getTransactionStatistics(): Promise<BaseResponse<TransactionStatistics>> {
  const res = await axiosNETClient.get("/api/v1/transactions/statistics");
  return res.data;
}