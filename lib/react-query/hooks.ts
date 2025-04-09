import { useState, useCallback, useEffect } from 'react';
import {
  useQuery as useBaseQuery,
  useMutation as useBaseMutation,
  useQueryClient,
  UseQueryResult,
  QueryKey,
  QueryFunction,
} from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { ApiError, EnhancedQueryOptions, EnhancedMutationOptions, QueryResult } from './types';

/**
 * Enhanced version of useQuery with better error handling and loading states
 */
export function useQuery<
  TQueryFnData = unknown,
  TError = ApiError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: EnhancedQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): QueryResult<TData, TError> {
  const { toast } = useToast();
  // Track if this is the initial loading state
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Use the base query hook
  const queryResult = useBaseQuery<TQueryFnData, TError, TData, TQueryKey>(options);
  
  // When query is no longer loading, mark initial loading as done
  useEffect(() => {
    if (!queryResult.isPending && isInitialLoading) {
      setIsInitialLoading(false);
    }
  }, [queryResult.isPending, isInitialLoading]);
  
  // Handle error notifications if enabled
  useEffect(() => {
    if (queryResult.isError && options.errorNotification !== false) {
      toast({
        title: 'Error',
        description: queryResult.error instanceof Error 
          ? queryResult.error.message 
          : 'An error occurred while fetching data',
        variant: 'destructive',
      });
    }
  }, [queryResult.isError, queryResult.error, options.errorNotification, toast]);
  
  // Return enhanced query result
  return {
    ...queryResult,
    // Additional computed properties
    isEmpty: !queryResult.isPending && !queryResult.data,
    isInitialLoading,
  };
}

/**
 * Enhanced useMutation hook with success/error notifications
 */
export function useMutation<
  TData = unknown,
  TError = ApiError,
  TVariables = void,
  TContext = unknown,
>(
  options: EnhancedMutationOptions<TData, TError, TVariables, TContext>,
) {
  const { toast } = useToast();
  
  // Use the base mutation hook with our modified options
  return useBaseMutation<TData, TError, TVariables, TContext>({
    ...options,
    onSuccess: (data, variables, context) => {
      // Call original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
      
      // Show success notification if enabled
      if (options.successNotification) {
        toast({
          title: options.successNotification.title || 'Success',
          description: options.successNotification.message || 'Operation completed successfully',
        });
      }
    },
    onError: (error, variables, context) => {
      // Call original onError if provided
      if (options.onError) {
        options.onError(error, variables, context);
      }
      
      // Show error notification if not explicitly disabled
      if (options.errorNotification?.title !== undefined || options.errorNotification?.message !== undefined || options.errorNotification === undefined) {
        toast({
          title: 
            options.errorNotification?.title || 
            'Error',
          description: 
            options.errorNotification?.message || 
            (error instanceof Error ? error.message : 'An error occurred'),
          variant: 'destructive',
        });
      }
    },
  });
}

/**
 * Hook for prefetching queries
 */
export function usePrefetch<
  TQueryFnData = unknown,
  TError = ApiError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>() {
  const queryClient = useQueryClient();
  
  const prefetch = useCallback(
    (queryKey: TQueryKey, queryFn: QueryFunction<TQueryFnData, TQueryKey>) => {
      return queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },
    [queryClient],
  );
  
  return { prefetch };
}

/**
 * Hook for entity-based cache operations
 */
export function useCacheOperations<T extends { _id: string }>(entityKey: QueryKey) {
  const queryClient = useQueryClient();
  
  // Update an entity in the cache
  const updateCache = useCallback(
    (updatedEntity: T) => {
      queryClient.setQueryData<T[]>(entityKey, (oldData) => {
        if (!oldData) return [updatedEntity];
        
        return oldData.map(item => 
          item._id === updatedEntity._id ? updatedEntity : item
        );
      });
    },
    [queryClient, entityKey],
  );
  
  // Add an entity to the cache
  const addToCache = useCallback(
    (newEntity: T) => {
      queryClient.setQueryData<T[]>(entityKey, (oldData) => {
        if (!oldData) return [newEntity];
        return [...oldData, newEntity];
      });
    },
    [queryClient, entityKey],
  );
  
  // Remove an entity from the cache
  const removeFromCache = useCallback(
    (id: string) => {
      queryClient.setQueryData<T[]>(entityKey, (oldData) => {
        if (!oldData) return [];
        return oldData.filter(item => item._id !== id);
      });
    },
    [queryClient, entityKey],
  );
  
  return {
    updateCache,
    addToCache,
    removeFromCache,
    invalidateQueries: () => queryClient.invalidateQueries({ queryKey: entityKey }),
  };
} 