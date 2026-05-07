import type {
  RAGApiResponse,
  RAGApiPaginatedResponse,
} from "@/types/APIResponse";
import { axiosRAGClient } from "./client";
import type { RAGDocument } from "@/types/RAGDocument";

export const bulkUploadDocument = async (
  formData: FormData,
): Promise<RAGApiResponse<any>> => {
  const res = await axiosRAGClient.post(
    `api/v1/documents/bulk-upload-documents/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
};

export const getDocumentList = async (params: {
  page: number;
  limit: number;
  q?: string;
}): Promise<RAGApiPaginatedResponse<RAGDocument>> => {
  const res = await axiosRAGClient.get(`api/v1/documents/`, {
    params: { ...params, limit: 10 },
  });
  return res.data;
};

export const getUncollectedDocuments = async (params: {
  page: number;
  limit: number;
  q?: string;
}): Promise<RAGApiPaginatedResponse<RAGDocument>> => {
  const res = await axiosRAGClient.get(`api/v1/documents/uncollected/`, {
    params: { ...params, limit: 10 },
  });
  return res.data;
};

export const getPendingDocuments = async (params: {
  page: number;
  limit: number;
  q?: string;
  collection_id?: string;
}): Promise<RAGApiPaginatedResponse<RAGDocument>> => {
  const res = await axiosRAGClient.get(`api/v1/documents/pending/`, {
    params: { ...params, limit: 10 },
  });
  return res.data;
};

export const deleteDocument = async (
  documentId: string,
): Promise<RAGApiResponse<null>> => {
  const res = await axiosRAGClient.delete(`api/v1/documents/${documentId}/`);
  return res.data;
};
