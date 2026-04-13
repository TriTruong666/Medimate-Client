import type { RAGApiResponse } from "@/types/APIResponse";
import type { AIModel, AIModelUpdate } from "@/types/RAGAIModel";
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

export const updateAIModel = async (
  model_id: string,
  data: AIModelUpdate,
): Promise<RAGApiResponse<AIModel>> => {
  const res = await axiosRAGClient.patch(`api/v1/ai-models/${model_id}`, data);
  return res.data;
};
