export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorBody {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export type ApiError = {
  status: number;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
};
