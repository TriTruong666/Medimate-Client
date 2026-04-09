import type { RAGChatRequest, RAGChatResponse } from "@/types/RAGChat";
import { axiosRAGClient } from "./client";
import type { RAGApiResponse } from "@/types/APIResponse";

export const chatWithAI = async (
  data: RAGChatRequest,
): Promise<RAGApiResponse<RAGChatResponse>> => {
  const res = await axiosRAGClient.post("api/v1/chat/completion/", data);
  return res.data;
};
