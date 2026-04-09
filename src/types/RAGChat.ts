export interface RAGChatResponse {
  answer: string;
}

export interface RAGChatRequest {
  question: string;
  ai_model_id: string;
}
