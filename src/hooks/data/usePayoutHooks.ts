import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/useToast";
import {
  getPayouts,
  getPayoutSummary,
  processPayout,
  getRefundableAppointments,
  completeRefund,
  type PayoutFilterDto,
  type ProcessPayoutDto,
} from "@/apis/payout.service";
import { completeSubscriptionRefund, getRefundableSubscriptions } from "@/apis/family-subscription.service";

export const PAYOUT_KEYS = {
  all: ["payouts"] as const,
  lists: () => [...PAYOUT_KEYS.all, "list"] as const,
  list: (params: PayoutFilterDto) => [...PAYOUT_KEYS.lists(), params] as const,
  summaries: () => [...PAYOUT_KEYS.all, "summary"] as const,
  refunds: () => ["appointments", "refunds"] as const,
  subscriptionRefunds: () => ["subscriptions", "refunds"] as const,
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

export function useRefundableAppointments() {
  return useQuery({
    queryKey: PAYOUT_KEYS.refunds(),
    queryFn: getRefundableAppointments,
  });
}

export function useRefundableSubscriptions() {
  return useQuery({
    queryKey: PAYOUT_KEYS.subscriptionRefunds(),
    queryFn: getRefundableSubscriptions,
  });
}

export function useCompleteRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, transferImage }: { appointmentId: string; transferImage?: File | null }) =>
      completeRefund(appointmentId, transferImage),
    onSuccess: () => {
      toast.success("Thành công", "Đã xác nhận hoàn tiền cho người dùng!");
      queryClient.invalidateQueries({ queryKey: PAYOUT_KEYS.refunds() });
    },
    onError: (error: any) => {
      toast.error("Thất bại", error?.response?.data?.message || "Lỗi khi xử lý hoàn tiền");
    },
  });
}

export function useCompleteSubscriptionRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, transferImage }: { subscriptionId: string; transferImage?: File | null }) =>
      completeSubscriptionRefund(subscriptionId, transferImage),
    onSuccess: () => {
      toast.success("Thành công", "Đã xác nhận hoàn tiền gói thành viên!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: PAYOUT_KEYS.subscriptionRefunds() });
    },
    onError: (error: any) => {
      toast.error("Thất bại", error?.response?.data?.message || "Lỗi khi xử lý hoàn tiền gói");
    },
  });
}
