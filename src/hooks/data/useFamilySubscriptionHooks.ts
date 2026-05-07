import * as FamilySubscriptionService from "@/apis/family-subscription.service";
import type {
  GetFamilySubscriptionsParams,
  FamilySubscriptionStatus,
  UpdateSubscriptionStatusRequest,
} from "@/apis/family-subscription.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "../useToast";

export function useFamilySubscriptions(params: GetFamilySubscriptionsParams) {
  return useQuery({
    queryKey: ["admin", "family-subscriptions", params],
    queryFn: async () => {
      const res = await FamilySubscriptionService.getFamilySubscriptions(params);
      return res;
    },
  });
}

export function useUpdateSubscriptionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      payload,
    }: {
      subscriptionId: string;
      payload: UpdateSubscriptionStatusRequest;
    }) => FamilySubscriptionService.updateSubscriptionStatus(subscriptionId, payload),
    onSuccess: (data, variables) => {
      if (data.success) {
        const statusLabel: Record<FamilySubscriptionStatus, string> = {
          Active: "Kích hoạt",
          Suspended: "Tạm ngưng",
          Cancelled: "Huỷ",
          Expired: "Hết hạn",
          Pending: "Chờ xử lý",
          Inactive: "Không hoạt động"
        };
        const label = statusLabel[variables.payload.status] ?? "Cập nhật";
        toast.success(`${label} thành công`, `Đã cập nhật trạng thái gói gia đình.`);
        queryClient.invalidateQueries({ queryKey: ["admin", "family-subscriptions"] });
        return;
      }
      toast.error("Cập nhật thất bại", translateErrorMessage(data.error?.code, data.message));
    },
    onError: (error: unknown) => {
      toast.error("Cập nhật thất bại", getApiErrorMessage(error));
    },
  });
}
