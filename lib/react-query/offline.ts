import { useCallback, useEffect, useState } from 'react';
import { QueryClient, QueryKey, hashKey } from '@tanstack/react-query';
import { ApiError } from './types';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useServiceWorker, MutationQueueItem } from '@/hooks/use-service-worker';

// Queue key for pending mutations
const MUTATION_QUEUE_KEY = 'app_mutation_queue';

/**
 * Structure for queued mutations
 */
interface QueuedMutation<TVariables> {
  id: string;
  mutationKey: unknown[];
  variables: TVariables;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

/**
 * Configuration options for offline mutations
 */
export interface OfflineOptions {
  retry?: boolean;
  maxRetries?: number;
  retryInterval?: number;
  onOfflineMutation?: (mutationKey: unknown[], variables: any) => void;
  onOnlineSync?: (results: Array<{ mutationId: string; success: boolean; error?: ApiError }>) => void;
}

/**
 * Options for offline-enabled mutations
 */
export interface OfflineMutationOptions<TData = unknown, TError = unknown, TVariables = void, TContext = unknown> 
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  /**
   * Whether to enable offline support for this mutation
   */
  offlineSupport?: boolean;
  
  /**
   * Function to transform variables into a request for the offline queue
   */
  getOfflineRequest?: (variables: TVariables) => MutationQueueItem;
}

/**
 * Queue a mutation to be executed when the app comes back online
 */
export function queueMutation<TVariables>(
  mutationKey: unknown[],
  variables: TVariables,
  options: { maxRetries?: number } = {}
): string {
  try {
    // Generate a unique ID for this mutation
    const mutationId = `${hashKey(mutationKey)}_${Date.now()}`;
    
    // Get existing queue
    const queueString = localStorage.getItem(MUTATION_QUEUE_KEY);
    const queue: QueuedMutation<any>[] = queueString ? JSON.parse(queueString) : [];
    
    // Add the new mutation to the queue
    queue.push({
      id: mutationId,
      mutationKey,
      variables,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
    });
    
    // Save back to storage
    localStorage.setItem(MUTATION_QUEUE_KEY, JSON.stringify(queue));
    
    return mutationId;
  } catch (error) {
    console.error('Failed to queue mutation:', error);
    throw error;
  }
}

/**
 * Remove a specific mutation from the queue
 */
export function removeMutationFromQueue(mutationId: string): boolean {
  try {
    const queueString = localStorage.getItem(MUTATION_QUEUE_KEY);
    if (!queueString) return false;
    
    const queue: QueuedMutation<any>[] = JSON.parse(queueString);
    const initialLength = queue.length;
    
    // Filter out the mutation with the given ID
    const newQueue = queue.filter(mutation => mutation.id !== mutationId);
    
    // Save back to storage if something was removed
    if (newQueue.length !== initialLength) {
      localStorage.setItem(MUTATION_QUEUE_KEY, JSON.stringify(newQueue));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to remove mutation from queue:', error);
    return false;
  }
}

/**
 * Process mutations in the queue
 */
async function processMutationQueue(
  queryClient: QueryClient,
  options: OfflineOptions = {}
): Promise<Array<{ mutationId: string; success: boolean; error?: ApiError }>> {
  const results: Array<{ mutationId: string; success: boolean; error?: ApiError }> = [];
  
  try {
    const queueString = localStorage.getItem(MUTATION_QUEUE_KEY);
    if (!queueString) return results;
    
    const queue: QueuedMutation<any>[] = JSON.parse(queueString);
    if (!queue.length) return results;
    
    // Process each mutation in the queue
    const newQueue: QueuedMutation<any>[] = [];
    
    for (const mutation of queue) {
      try {
        // Execute the mutation using the current API in Tanstack Query v5
        await queryClient.mutate({
          mutationKey: mutation.mutationKey as QueryKey,
          mutationFn: async () => {
            // In a real implementation, this would call your API endpoint with the variables
            // The actual mutation function would be provided dynamically based on the mutationKey
            // Here we're simulating the mutation succeeding
            return mutation.variables;
          },
          variables: mutation.variables,
        });
        
        // If successful, add to results
        results.push({ mutationId: mutation.id, success: true });
      } catch (error) {
        // Determine if we should retry
        const shouldRetry = options.retry !== false && 
          mutation.retryCount < mutation.maxRetries;
        
        if (shouldRetry) {
          // Increment retry count and keep in queue
          mutation.retryCount++;
          newQueue.push(mutation);
        }
        
        // Add to results
        results.push({ 
          mutationId: mutation.id, 
          success: false, 
          error: error as ApiError
        });
      }
    }
    
    // Save the updated queue
    localStorage.setItem(MUTATION_QUEUE_KEY, JSON.stringify(newQueue));
    
    // Notify of sync results if provided
    if (options.onOnlineSync && results.length > 0) {
      options.onOnlineSync(results);
    }
    
    return results;
  } catch (error) {
    console.error('Failed to process mutation queue:', error);
    return results;
  }
}

/**
 * Get the current mutation queue
 */
export function getMutationQueue(): QueuedMutation<any>[] {
  try {
    const queueString = localStorage.getItem(MUTATION_QUEUE_KEY);
    return queueString ? JSON.parse(queueString) : [];
  } catch (error) {
    console.error('Failed to get mutation queue:', error);
    return [];
  }
}

/**
 * Clear the entire mutation queue
 */
export function clearMutationQueue(): void {
  localStorage.removeItem(MUTATION_QUEUE_KEY);
}

/**
 * Hook to provide offline mutation support
 */
export function useOfflineMutations(
  queryClient: QueryClient,
  options: OfflineOptions = {}
) {
  // Track online status
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  // Track queued mutations
  const [queuedMutations, setQueuedMutations] = useState<QueuedMutation<any>[]>([]);
  
  // Update online status
  const updateOnlineStatus = useCallback(() => {
    const status = navigator.onLine;
    setIsOnline(status);
    
    // Process queue when coming back online
    if (status) {
      processMutationQueue(queryClient, options);
    }
  }, [queryClient, options]);
  
  // Update queue state
  const updateQueueState = useCallback(() => {
    setQueuedMutations(getMutationQueue());
  }, []);
  
  // Queue a mutation
  const queueOfflineMutation = useCallback(<TVariables,>(
    mutationKey: unknown[],
    variables: TVariables
  ): string => {
    const mutationId = queueMutation(mutationKey, variables, {
      maxRetries: options.maxRetries,
    });
    
    // Update the queue state
    updateQueueState();
    
    // Notify if handler provided
    if (options.onOfflineMutation) {
      options.onOfflineMutation(mutationKey, variables);
    }
    
    return mutationId;
  }, [options, updateQueueState]);
  
  // Execute any pending mutations
  const syncMutations = useCallback(async () => {
    if (!isOnline) return [];
    
    const results = await processMutationQueue(queryClient, options);
    updateQueueState();
    return results;
  }, [queryClient, options, isOnline, updateQueueState]);
  
  // Set up online/offline event listeners
  useEffect(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Set initial queue state
    updateQueueState();
    
    // Set up periodic sync attempts if online
    let syncInterval: NodeJS.Timeout | undefined;
    
    if (options.retryInterval && options.retryInterval > 0) {
      syncInterval = setInterval(() => {
        if (isOnline) {
          syncMutations();
        }
      }, options.retryInterval);
    }
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [
    updateOnlineStatus, 
    updateQueueState, 
    syncMutations, 
    options.retryInterval, 
    isOnline
  ]);
  
  return {
    isOnline,
    queuedMutations,
    queueMutation: queueOfflineMutation,
    syncMutations,
    hasPendingMutations: queuedMutations.length > 0,
    removeQueuedMutation: (mutationId: string) => {
      const removed = removeMutationFromQueue(mutationId);
      if (removed) updateQueueState();
      return removed;
    },
    clearQueue: () => {
      clearMutationQueue();
      updateQueueState();
    },
  };
}

/**
 * Helper to prepare data for offline-first access
 * 
 * @param queryClient React Query client instance
 * @param queryKey The query key to prefetch
 * @param queryFn The function to fetch the data
 * @param staleTime How long the data should be considered fresh (default: 1 hour)
 */
export async function prefetchForOffline<TData>(
  queryClient: QueryClient,
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  staleTime = 60 * 60 * 1000
): Promise<boolean> {
  try {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime,
      gcTime: Infinity, // Keep in cache indefinitely for offline use (v5 uses gcTime instead of cacheTime)
    });
    return true;
  } catch (error) {
    console.error('Failed to prefetch for offline:', error);
    return false;
  }
}

/**
 * Check if a specific query has offline data available
 */
export function hasOfflineData(
  queryClient: QueryClient,
  queryKey: unknown[]
): boolean {
  const data = queryClient.getQueryData(queryKey);
  return data !== undefined;
}

/**
 * Hook to create mutations that work offline
 * Combines React Query's useMutation with offline queue capabilities
 */
export function useOfflineMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  options: OfflineMutationOptions<TData, TError, TVariables, TContext>
) {
  const { addToMutationQueue, isOnline, triggerSync } = useServiceWorker();
  
  // Extract offline-specific options
  const { 
    offlineSupport = false, 
    getOfflineRequest,
    mutationFn,
    onMutate,
    onError,
    onSettled,
    ...mutationOptions 
  } = options;
  
  // Create enhanced mutation
  return useMutation<TData, TError, TVariables, TContext>({
    ...mutationOptions,
    
    // Override mutation function to handle offline case
    mutationFn: async (variables) => {
      // If online, proceed with normal mutation
      if (isOnline || !offlineSupport) {
        if (!mutationFn) {
          throw new Error('mutationFn is required when not using offline support');
        }
        return mutationFn(variables);
      }
      
      // We're offline and offline support is enabled
      if (!getOfflineRequest) {
        throw new Error('getOfflineRequest is required when using offline support');
      }
      
      // Add to offline queue
      const request = getOfflineRequest(variables);
      await addToMutationQueue(request);
      
      // Try to trigger a background sync
      triggerSync().catch(() => {
        // Sync registration failed, but that's okay
        // The mutation is already in the queue
      });
      
      // Return a mock response for offline mode
      // This could potentially be enhanced to return mock data
      return { success: true, offline: true } as unknown as TData;
    },
    
    // Enhanced callbacks
    onMutate: async (variables) => {
      // Call original onMutate if provided
      let context = undefined;
      if (onMutate) {
        context = await onMutate(variables);
      }
      
      // Return context with offline flag
      return {
        ...context,
        isOffline: !isOnline && offlineSupport,
      } as TContext;
    },
    
    onError: (error, variables, context) => {
      // Skip error handling for offline mutations
      const ctx = context as any;
      if (ctx?.isOffline) {
        return;
      }
      
      // Call original onError if provided
      if (onError) {
        onError(error, variables, context);
      }
    },
    
    onSettled: (data, error, variables, context) => {
      // Call original onSettled if provided
      if (onSettled) {
        onSettled(data, error, variables, context);
      }
    },
  });
} 