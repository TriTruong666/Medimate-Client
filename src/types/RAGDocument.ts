export interface RAGDocument {
    id: string;
    doc_name: string;
    file_path: string;
    type: string;
    status: string;
    file_size: number
    created_at: string;
}