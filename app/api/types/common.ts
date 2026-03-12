// Common API types matching the response envelope from API Contracts v1.0

export interface ApiMeta {
  timestamp: string;
  requestId: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  meta: ApiMeta;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  errors?: FieldError[];
  traceId: string;
}

export interface FieldError {
  field: string;
  message: string;
}

// Common query params for list endpoints
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface DateRangeParams {
  fromDate?: string;
  toDate?: string;
}

// UUID type alias for documentation
export type UUID = string;

// Decimal types stored as strings to avoid floating-point issues
export type Money = string;     // decimal(18,2)
export type Weight = string;    // decimal(18,4)
export type Percentage = string; // decimal(8,4)

// ISO 8601 timestamp/date strings
export type Timestamp = string;
export type DateString = string;
