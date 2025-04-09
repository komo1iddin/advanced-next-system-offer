import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useServiceWorker, MutationQueueItem } from '@/hooks/use-service-worker';

/**
 * Options for offline-enabled mutations with enhanced service worker support
 */
export interface EnhancedOfflineMutationOptions<TData = unknown, TError = unknown, TVariables = void, TContext = unknown> 
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
 * Hook to create mutations that work offline with enhanced service worker capabilities
 * Combines React Query's useMutation with service worker offline queue
 */
export function useEnhancedOfflineMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  options: EnhancedOfflineMutationOptions<TData, TError, TVariables, TContext>
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
