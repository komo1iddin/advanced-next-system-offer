import { BaseError } from '@/lib/errors';
import type { 
  QueryKey, 
  UseQueryResult, 
  UseMutationResult,
  UseMutationOptions,
  UseQueryOptions,
  QueryClient,
} from '@tanstack/react-query';

// Define common API response structure
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Define common error structure
export interface ApiError extends BaseError {
  status?: number;
  code?: string;
}

// Helper type to handle pagination responses
export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    perPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Type for filters commonly used in queries
export interface QueryFilters {
  search?: string;
  active?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  [key: string]: any;
}

// Enhanced query result type
export type QueryResult<TData, TError = ApiError> = UseQueryResult<TData, TError> & {
  isEmpty: boolean;
  isInitialLoading: boolean;
};

// Enhance existing query options with defaults
export type EnhancedQueryOptions<
  TQueryFnData = unknown,
  TError = ApiError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  loadingNotification?: boolean;
  errorNotification?: boolean;
};

// Enhanced mutation options with defaults
export type EnhancedMutationOptions<
  TData = unknown,
  TError = ApiError,
  TVariables = void,
  TContext = unknown
> = UseMutationOptions<TData, TError, TVariables, TContext> & {
  successNotification?: {
    title?: string;
    message?: string;
  };
  errorNotification?: {
    title?: string;
    message?: string;
  };
};

// Enhanced mutation result type
export type MutationResult<TData, TError = ApiError, TVariables = void, TContext = unknown> = 
  UseMutationResult<TData, TError, TVariables, TContext>;

// Interface for a cached entity
export interface CachedEntity {
  _id: string;
  [key: string]: any;
}

// Type for query invalidation functions
export type InvalidateQueriesConfig = Parameters<QueryClient['invalidateQueries']>[0];

// Helper function types for query cache manipulation
export type UpdaterFn<T> = (old: T | undefined) => T;
export type RemoverFn<T extends CachedEntity> = (entity: T) => boolean; 