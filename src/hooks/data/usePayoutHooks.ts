import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/useToast";
import {
  getPayouts,
  getPayoutSummary,
  processPayout,
  type PayoutFilterDto,
  type ProcessPayoutDto,
} from "@/apis/payout.service";

export const PAYOUT_KEYS = {
  all: ["payouts"] as const,
  lists: () => [...PAYOUT_KEYS.all, "list"] as const,
  list: (params: PayoutFilterDto) => [...PAYOUT_KEYS.lists(), params] as const,
  summaries: () => [...PAYOUT_KEYS.all, "summary"] as const,
};

export function usePayouts(params: PayoutFilterDto) {
  return useQuery({
    queryKey: PAYOUT_KEYS.list(params),
    queryFn: () => getPayouts(params),
  });
}

export function usePayoutSummary() {
  return useQuery({
    queryKey: PAYOUT_KEYS.summaries(),
    queryFn: () => getPayoutSummary(),
  });
}

export function useProcessPayoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clinicId,
      payload,
    }: {
      clinicId: string;
      payload: ProcessPayoutDto;
    }) => processPayout(clinicId, payload),
    onSuccess: () => {
      toast.success("Thành công", "Đã xác nhận thanh toán công nợ phòng khám!");
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
