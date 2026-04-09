import type { BasePaginatedResponse } from "@/types/APIResponse";
import { axiosNETClient } from "./client";
import { cleanQueryParams } from "@/common/query.params";

export type Rating = {
  ratingId: string;
  sessionId: string;
  doctorId: string;
  doctorName: string;
  memberId: string;
  memberName: string;
  score: number;
  comment: string;
  imageUrl: string | null;
  createdAt: string;
};

export type GetRatingsParams = {
  pageNumber?: number;
  pageSize?: number;
};

export async function getRatings(
  params: GetRatingsParams,
): Promise<BasePaginatedResponse<Rating[]>> {
  const res = await axiosNETClient.get("/api/v1/ratings", {
    params: cleanQueryParams<GetRatingsParams>(params),
  });
  return res.data;
}
