import type { QueryParams } from "@/common/query.params";

export type Transaction = {
  transactionId: string;
  transactionCode: string;
  transactionDate: string;
  transactionType: string;
  totalAmount: number;
  status: string;
};

export type GetTransactionsParams = QueryParams<Transaction> & {
  searchTerm?: string;
  type?: string;
  status?: string;
};