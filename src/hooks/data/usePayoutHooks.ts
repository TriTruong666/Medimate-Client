import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/useToast";
import {
  getPendingPayouts,
  getPaidPayouts,
  approvePayout,
  type GetPayoutsParams,
  type ApprovePayoutPayload,
} from "@/apis/payout.service";

export const PAYOUT_KEYS = {
  all: ["payouts"] as const,
  pendingList: (params: GetPayoutsParams) =>
    [...PAYOUT_KEYS.all, "pending", params] as const,
  paidList: (params: GetPayoutsParams) =>
    [...PAYOUT_KEYS.all, "paid", params] as const,
};

export function usePendingPayouts(params: GetPayoutsParams) {
  return useQuery({
    queryKey: PAYOUT_KEYS.pendingList(params),
    queryFn: () => getPendingPayouts(params),
  });
}

export function usePaidPayouts(params: GetPayoutsParams) {
  return useQuery({
    queryKey: PAYOUT_KEYS.paidList(params),
    queryFn: () => getPaidPayouts(params),
  });
}

export function useApprovePayoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payoutId,
      payload,
    }: {
      payoutId: string;
      payload: ApprovePayoutPayload;
    }) => approvePayout(payoutId, payload),
    onSuccess: () => {
      toast.success("Thành công", "Duyệt phiếu thanh toán thành công!");
      // Invalidate both pending and paid lists
      queryClient.invalidateQueries({ queryKey: PAYOUT_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(
        "Thất bại",
        error?.response?.data?.message || "Đã xảy ra lỗi khi duyệt thanh toán",
      );
    },
  });
}
