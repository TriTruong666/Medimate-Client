import type { QueryParams } from "@/common/query.params";

export type Transaction = {
  transactionId: string;
  transactionCode: string;
  transactionDate: string;
  transactionType: string;
  totalAmount: number;
  status: string;
  referenceId?: string;
};

export type TransactionDetail = {
  transactionId: string;
  senderName: string;
  receiverName: string;
  transactionType: string;
  content: string;
  amount: number;
  transactionFee: number;
  totalAmount: number;
  transactionCode: string;
  paymentCode: string;
  appointmentDate: string | null;
  paymentMethod: string;
  paymentStatus: string;
};

export type GetTransactionsParams = QueryParams<Transaction> & {
  searchTerm?: string;
  type?: string;
  status?: string;
};

export type TransactionStatistics = {
  totalIncoming: number;
  totalOutgoing: number;
  netRevenue: number;
};