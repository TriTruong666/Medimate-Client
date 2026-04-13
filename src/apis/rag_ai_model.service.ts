import type { RAGApiResponse } from "@/types/APIResponse";
import type { AIModel } from "@/types/RAGAIModel";
import { axiosRAGClient } from "./client";

export const getAIModelList = async (params: {
  skip: number;
  limit: number;
}): Promise<RAGApiResponse<AIModel[]>> => {
  const res = await axiosRAGClient.get("api/v1/ai-models", {
    params: { ...params, limit: 10 },
  });
  return res.data;
};
