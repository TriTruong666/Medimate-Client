import * as NotificationService from "@/apis/notification.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../useFetch";
import { toast } from "../useToast";

export function useNotifications() {
  return useFetch(["notifications"], () => NotificationService.getNotifications());
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      NotificationService.markNotificationRead(notificationId),
    onSuccess: (data) => {
      if (data.success) {
        void queryClient.invalidateQueries({ queryKey: ["notifications"] });
        return;
      }

      toast.error(
        "Thất bại",
        translateErrorMessage(data.error?.code, data.message),
      );
    },
    onError: (error: unknown) => {
      toast.error("Thất bại", getApiErrorMessage(error));
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.markAllNotificationsRead,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã đánh dấu tất cả thông báo là đã đọc.");
        void queryClient.invalidateQueries({ queryKey: ["notifications"] });
        return;
      }

      toast.error(
        "Thất bại",
        translateErrorMessage(data.error?.code, data.message),
      );
    },
    onError: (error: unknown) => {
      toast.error("Thất bại", getApiErrorMessage(error));
    },
  });
}
