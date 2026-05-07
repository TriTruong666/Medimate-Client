export interface AIModel {
  name: string;
  is_active: boolean;
  provider: string;
  id: string;
  context_window: number;
  max_output_tokens: number;
  created_at: string;
  config: {
    api_key: string;
    model_name: string;
  };
}

export interface AIModelUpdate {
  name: string;
  provider: string;
  config: Record<string, any>;
  context_window: number;
  max_output_tokens: number;
  is_active: boolean;
}