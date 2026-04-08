import type {
  RAGApiPaginatedResponse,
  RAGApiResponse,
} from "@/types/APIResponse";
import { axiosRAGClient } from "./client";
import type {
  AssignDocumentToCollectionRequest,
  CreateCollectionRequest,
  RAGCollection,
} from "@/types/RAGCollection";

export const createCollection = async (
  data: CreateCollectionRequest,
): Promise<RAGApiResponse<null>> => {
  const res = await axiosRAGClient.post(`api/v1/collections`, data);
  return res.data;
};

export const getCollectionList = async (params: {
  page: number;
  limit: number;
  q?: string;
}): Promise<RAGApiPaginatedResponse<RAGCollection>> => {
  const res = await axiosRAGClient.get(`api/v1/collections`, { params });
  return res.data;
};

export const getDetailCollection = async (
  collectionId: string,
): Promise<RAGApiResponse<RAGCollection>> => {
  const res = await axiosRAGClient.get(`api/v1/collections/${collectionId}`);
  return res.data;
};

export const assignDocumentToCollection = async (
  collectionId: string,
  data: AssignDocumentToCollectionRequest,
): Promise<RAGApiResponse<null>> => {
  const res = await axiosRAGClient.post(
    `api/v1/collections/${collectionId}/assign-documents`,
    data,
  );
  return res.data;
};

export const processCollection = async (
  collectionId: string,
  params: { client_id: string },
): Promise<RAGApiResponse<null>> => {
  const res = await axiosRAGClient.post(
    `api/v1/collections/${collectionId}/process`,
    params,
  );
  return res.data;
};
