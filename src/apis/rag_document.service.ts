import type { RAGApiResponse, RAGApiPaginatedResponse } from "@/types/APIResponse";
import { axiosRAGClient } from "./client";
import type { RAGDocument } from "@/types/RAGDocument";

export const bulkUploadDocument = async (filesString: string[]): Promise<RAGApiResponse<null>> => {
    const res = await axiosRAGClient.post(`api/v1/documents/bulk-upload-documents`, filesString)
    return res.data
}

export const getDocumentList = async (params: { page: number, limit: number, q?: string }): Promise<RAGApiPaginatedResponse<RAGDocument>> => {
    const res = await axiosRAGClient.get(`api/v1/documents`, { params })
    return res.data
}