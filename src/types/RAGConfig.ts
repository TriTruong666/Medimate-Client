export interface RAGConfig {
  id: number;
  name: string;
  top_k: number;
  default_llm_id: string;
  threshold: number;
  temperature: number;
  prompt_template: string;
  updated_at: string;
}

export interface RAGConfigUpdate {
  name?: string;
  top_k?: number;
  default_llm_id?: string;
  threshold?: number;
  temperature?: number;
  prompt_template?: string;
}
