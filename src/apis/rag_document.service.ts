import type { RAGApiResponse, RAGApiPaginatedResponse } from "@/types/APIResponse";
import { axiosRAGClient } from "./client";
import type { RAGDocument } from "@/types/RAGDocument";

export const bulkUploadDocument = async (formData: FormData): Promise<RAGApiResponse<any>> => {
    const res = await axiosRAGClient.post(`api/v1/documents/bulk-upload-documents`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return res.data
}

export const getDocumentList = async (params: { page: number, limit: number, q?: string }): Promise<RAGApiPaginatedResponse<RAGDocument>> => {
    const res = await axiosRAGClient.get(`api/v1/documents`, { params })
    return res.data
}