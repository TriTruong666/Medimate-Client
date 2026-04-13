import { axiosRAGClient } from "./client";
import type { RAGApiResponse } from "@/types/APIResponse";

export type SystemHealthData = {
  version: string;
  author: string;
};

export const getRagServerHealth = async (): Promise<RAGApiResponse<SystemHealthData>> => {
  const res = await axiosRAGClient.get("/system/health");
  return res.data;
};
