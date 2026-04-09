export interface AIModel {
  name: string;
  is_active: boolean;
  provider: string;
  id: string;
  context_window: number;
  max_output_tokens: number;
  created_at: string;
}
