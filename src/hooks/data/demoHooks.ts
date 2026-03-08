import { useFetch } from "../useFetch";
import * as DemoService from "@/apis/test.service";

export function useGetDemoData() {
  return useFetch(["demo-users"], async () => DemoService.demoService());
}
