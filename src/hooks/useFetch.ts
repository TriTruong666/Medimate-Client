/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseResponse } from "@/types/APIResponse";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export function useFetch<T>(
  queryKey: any[],
  queryFn: () => Promise<BaseResponse<T>>,
  options?: Omit<UseQueryOptions<BaseResponse<T>, Error>, "queryKey" | "queryFn">,
) {
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<BaseResponse<T>, Error>({
    queryKey,
    queryFn: async () => {
      const res = await queryFn();
      if (!res.success) {
        throw new Error(res.message || "An error occurred while fetching data");
      }
      return res;
    },
    ...options,
  });

  return {
    data: response?.data,
    fullResponse: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  };
}
