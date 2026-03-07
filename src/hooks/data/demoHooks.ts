import { useFetch } from "../useFetch";

export const useGetDemoData = (
  page: number,
  limit: number,
  status?: string,
  finStatus?: string,
  carryStatus?: string,
  realCarryStatus?: string,
  source?: string,
  query?: string,
) => {
  return useFetch<DemoData[]>(
    [
      "orders",
      page,
      limit,
      status,
      finStatus,
      carryStatus,
      realCarryStatus,
      source,
      query,
    ],
    async () =>
      DemoService.getOrderService(
        page,
        limit,
        status,
        finStatus,
        carryStatus,
        realCarryStatus,
        source,
        query,
      ),
  );
};
