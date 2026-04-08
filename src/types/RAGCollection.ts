export interface RAGCollection {
  id: string;
  created_at: string;
  description: string;
  is_active: boolean;
  name: string;
}

export interface CreateCollectionRequest {
  name: string;
  description: string;
  is_active: boolean;
}

export interface AssignDocumentToCollectionRequest {
  document_ids: string[];
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}
