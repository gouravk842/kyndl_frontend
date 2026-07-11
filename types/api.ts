export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Django/DRF error shape, forwarded verbatim by the BFF. Domain errors arrive
 * as `{ detail, code }`; field validation errors as `{ <field>: ["msg"] }`.
 */
export interface ApiErrorBody {
  detail?: string | string[];
  code?: string;
  retry_after_seconds?: number;
  [field: string]: unknown;
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
  retryAfterSeconds?: number;
  /** The raw Django error body, for callers that need extra fields (e.g. the
   *  `product` carried by a 402 payment_required response). */
  details?: ApiErrorBody;
};
