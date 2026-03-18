export interface PaginationParams {
    pageNumber?: number;
    pageSize?: number;
}

export interface QueryParams<T extends Record<string, unknown>> extends PaginationParams {
    sortBy?: keyof T & string;
    isDescending?: boolean;
}

export function cleanQueryParams<T extends object>(params: T) {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== "" && value !== null),
    );
}