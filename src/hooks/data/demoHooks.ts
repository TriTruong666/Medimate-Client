import { useFetch, useSuspenseFetch } from "../useFetch";
import * as DemoService from "@/apis/test.service";

export function useGetDemoData() {
  return useFetch(["demo-users"], async () => DemoService.demoService());
}

export function useGetDemoDataSuspense() {
  return useSuspenseFetch(["demo-users"], async () =>
    DemoService.demoService(),
  );
}
