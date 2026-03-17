import type { BaseResponse } from "@/types/APIResponse";
import { axiosNETClient } from "./client";
import type { Package, UpdatePackageRequest } from "@/types/Package";

export async function getPackages(): Promise<BaseResponse<Package[]>> {
  const res = await axiosNETClient.get("/api/v1/membership-packages");
  const response = res.data as BaseResponse<Package[]>;
  const normalizedData = (response.data ?? []).map((item) => ({
    ...item,
    activeSubscriberCount:
      item.activeSubscriberCount ?? (item as Package & { ActiveSubscriberCount?: number }).ActiveSubscriberCount ?? 0,
  }));

  return {
    ...response,
    data: normalizedData,
  };
}

export async function updatePackage(
  packageId: string,
  request: UpdatePackageRequest,
): Promise<BaseResponse<Package>> {
  const res = await axiosNETClient.put(
    `/api/v1/membership-packages/${packageId}`,
    request,
  );
  return res.data;
}

export async function createPackage(
  request: UpdatePackageRequest,
): Promise<BaseResponse<Package>> {
  const res = await axiosNETClient.post("/api/v1/membership-packages", request);
  return res.data;
}

export async function deletePackage(
  packageId: string,
): Promise<BaseResponse<null>> {
  const res = await axiosNETClient.delete(
    `/api/v1/membership-packages/${packageId}`,
  );
  return res.data;
}