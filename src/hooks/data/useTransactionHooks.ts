import * as TransactionService from "@/apis/transaction.service";
import { useFetch } from "../useFetch";
import type { GetTransactionsParams } from "@/types/Transaction";

export function useTransactionList(params: GetTransactionsParams) {
  return useFetch(["transactions", params], async () =>
    TransactionService.getTransactions(params),
  );
}
