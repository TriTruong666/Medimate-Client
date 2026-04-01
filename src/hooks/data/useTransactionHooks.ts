import * as TransactionService from "@/apis/transaction.service";
import { useFetch } from "../useFetch";
import type { GetTransactionsParams } from "@/types/Transaction";

type TransactionQueryOptions = {
  enabled?: boolean;
};

export function useTransactionList(
  params: GetTransactionsParams,
  options?: TransactionQueryOptions,
) {
  return useFetch(
    ["transactions", params],
    async () => TransactionService.getTransactions(params),
    {
      enabled: options?.enabled,
    },
  );
}

export function useTransactionDetail(id?: string | null) {
  return useFetch(
    ["transaction-detail", id],
    async () => TransactionService.getTransactionDetail(id as string),
    {
      enabled: !!id,
    },
  );
}

export function useUserTransactionList(
  userId: string,
  params: GetTransactionsParams,
  options?: TransactionQueryOptions,
) {
  return useFetch(
    ["transactions", userId, params],
    async () => TransactionService.getUserTransactions(userId, params),
    {
      enabled: options?.enabled,
    },
  );
}

