export type BASEAPIResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
