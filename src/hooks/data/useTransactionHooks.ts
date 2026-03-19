import * as TransactionService from "@/apis/transaction.service";
import { useFetch } from "../useFetch";
import type { GetTransactionsParams } from "@/types/Transaction";

export function useTransactionList(params: GetTransactionsParams) {
  return useFetch(["transactions", params], async () =>
    TransactionService.getTransactions(params),
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
