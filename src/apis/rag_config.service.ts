import type { RAGApiResponse } from "@/types/APIResponse";
import type { RAGConfig, RAGConfigUpdate } from "@/types/RAGConfig";
import { axiosRAGClient } from "./client";

/**
 * Lấy cấu hình RAG hiện tại của hệ thống
 */
export const getCurrentRAGConfig = async (): Promise<
  RAGApiResponse<RAGConfig>
> => {
  const res = await axiosRAGClient.get("api/v1/rag-config/current");
  return res.data;
};

/**
 * Cập nhật cấu hình RAG hiện tại
 */
export const updateRAGConfig = async (
  data: RAGConfigUpdate,
): Promise<RAGApiResponse<RAGConfig>> => {
  const res = await axiosRAGClient.put("api/v1/rag-config/1", data);
  return res.data;
};
