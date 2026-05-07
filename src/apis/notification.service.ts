import type { BaseResponse } from "@/types/APIResponse";
import type { AppNotification } from "@/types/Notification";
import { axiosNETClient } from "./client";

export async function getNotifications(): Promise<BaseResponse<AppNotification[]>> {
  const res = await axiosNETClient.get("/api/v1/notifications");
  return res.data;
}

export async function markNotificationRead(
  notificationId: string,
): Promise<BaseResponse<boolean>> {
  const res = await axiosNETClient.put(
    `/api/v1/notifications/${notificationId}/read`,
  );
  return res.data;
}

export async function markAllNotificationsRead(): Promise<BaseResponse<boolean>> {
  const res = await axiosNETClient.put("/api/v1/notifications/read-all");
  return res.data;
}
