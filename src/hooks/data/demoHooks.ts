import type { DemoUser } from "@/types/APIResponse";
import { useFetch } from "../useFetch";
import * as DemoService from "@/apis/test.service";

export function useGetDemoData() {
  return useFetch<DemoUser[]>(["demo-users"], async () =>
    DemoService.demoService(),
  );
}
