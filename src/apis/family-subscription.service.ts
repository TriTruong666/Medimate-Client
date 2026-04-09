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
    params: cleanQueryParams<GetFamilySubscriptionsParams>(params),
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
