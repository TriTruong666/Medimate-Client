import type { BasePaginatedResponse } from "@/types/APIResponse";
import { cleanQueryParams } from "@/common/query.params";
import type { GetTransactionsParams, Transaction } from "@/types/Transaction";
import { axiosNETClient } from "./client";

export async function getTransactions(
  params: GetTransactionsParams,
): Promise<BasePaginatedResponse<Transaction[]>> {
  const res = await axiosNETClient.get("/api/v1/transactions", {
    params: cleanQueryParams<GetTransactionsParams>(params),
  });
  return res.data;
}