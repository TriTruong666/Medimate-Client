import type { BasePaginatedResponse, BaseResponse } from "@/types/APIResponse";
import { axiosNETClient } from "./client";
import { cleanQueryParams } from "@/common/query.params";

export type FamilySubscriptionStatus =
  | "Pending"
  | "Active"
  | "Expired"
  | "Cancelled"
  | "Suspended"
  | "Inactive";

export type FamilySubscription = {
  subscriptionId: string;
  familyId: string;
  familyName: string;
  familyAvatarUrl: string | null;
  packageName: string;
  startDate: string;
  endDate: string;
  status: FamilySubscriptionStatus | string;
  remainingOcrCount: number;
  remainingConsultantCount: number;
  price: number;
  userName: string;
  userEmail: string;
};

export type GetFamilySubscriptionsParams = {
  status?: FamilySubscriptionStatus;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
};

export type UpdateSubscriptionStatusRequest = {
  status: FamilySubscriptionStatus;
  reason?: string;
};

export async function getFamilySubscriptions(
  params: GetFamilySubscriptionsParams,
): Promise<BasePaginatedResponse<FamilySubscription[]>> {
  const res = await axiosNETClient.get("/api/v1/admin/family-subscriptions", {
    params: cleanQueryParams<GetFamilySubscriptionsParams>({ ...params, pageSize: 10 }),
  });
  return res.data;
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  payload: UpdateSubscriptionStatusRequest,
): Promise<BaseResponse<FamilySubscription>> {
  const res = await axiosNETClient.patch(
    `/api/v1/admin/family-subscriptions/${subscriptionId}/status`,
    payload,
  );
  return res.data;
}

export async function completeSubscriptionRefund(
  subscriptionId: string,
  transferImage?: File | null,
): Promise<BaseResponse<boolean>> {
  const formData = new FormData();
  if (transferImage) formData.append("TransferImage", transferImage);
  const res = await axiosNETClient.post(
    `/api/v1/families/subscriptions/${subscriptionId}/complete-refund`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
}

export type RefundableSubscriptionDto = {
  subscriptionId: string;
  familyId: string;
  familyName: string;
  packageId: string;
  packageName: string;
  userId: string;
  userName: string | null;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
};

export async function getRefundableSubscriptions(): Promise<BaseResponse<RefundableSubscriptionDto[]>> {
  const res = await axiosNETClient.get("/api/v1/families/subscriptions/refundable");
  return res.data;
}
