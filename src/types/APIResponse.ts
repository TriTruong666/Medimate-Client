export interface BaseResponse<T> {
  success: boolean;
  code: number;
  message: string;
  error?: {
    code?: string | number;
    message?: string;
    field?: string;
  };
  data?: T | null;
}

export interface BasePaginatedResponse<T> {
  success: boolean;
  code: number;
  message: string;
  error?: {
    code?: string | number;
    message?: string;
    field?: string;
  };
  data?: {
    items: T | null;
    totalCount?: number;
    pageNumber?: number;
    pageSize?: number;
    totalPages?: number;
  } | null;
}

export interface RAGPaginationMetadata {
  current_page: number;
  total_pages: number;
  limit: number;
  total_records: number;
}

export interface RAGApiPaginatedResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: {
    items: T[];
    pagination: RAGPaginationMetadata;
  };
}

export interface RAGApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}
