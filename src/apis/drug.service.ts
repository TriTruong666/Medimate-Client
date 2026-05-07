import type { BaseResponse } from "@/types/APIResponse";
import type { DrugDto } from "@/types/Drug";
import { axiosNETClient } from "./client";

export async function searchDrugs(
  query: string,
  limit = 10,
): Promise<BaseResponse<DrugDto[]>> {
  const res = await axiosNETClient.get("/api/v1/drugs/search", {
    params: { query, limit },
  });
  return res.data;
}
