import { useQuery } from "@tanstack/react-query";
import { getRatings, type GetRatingsParams } from "@/apis/rating.service";

export const RATING_KEYS = {
  all: ["ratings"] as const,
  lists: () => [...RATING_KEYS.all, "list"] as const,
  list: (params: GetRatingsParams) => [...RATING_KEYS.lists(), params] as const,
};

export function useRatings(params: GetRatingsParams) {
  return useQuery({
    queryKey: RATING_KEYS.list(params),
    queryFn: () => getRatings(params),
  });
}
