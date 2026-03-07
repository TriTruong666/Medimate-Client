/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export function useFetch<T>(
  queryKey: any[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">,
) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<T>({
    queryKey,
    queryFn,
    ...options,
  });

  return { data, isLoading, isError, error, refetch, isFetching };
}
