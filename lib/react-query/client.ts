import { QueryClient, DefaultOptions, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

// Default error handler that will show toast notifications for query errors
const defaultErrorHandler = (error: unknown) => {
  const message = error instanceof Error 
    ? error.message 
    : 'An unknown error occurred';
  
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Query Error]:', error);
  }
};

// Default query options
export const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes by default
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry for 404s and authentication errors
      if (
        error instanceof Error &&
        (error.message.includes('not found') || 
         error.message.includes('unauthorized') ||
         error.message.includes('unauthenticated') ||
         error.message.includes('403') ||
         error.message.includes('404') ||
         error.message.includes('401'))
      ) {
        return false;
      }
      // Otherwise retry up to 2 times
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: false,
  },
};

// Custom environment-specific configuration
const getEnvironmentConfig = (): Partial<DefaultOptions> => {
  // You can add environment-specific configurations here
  if (process.env.NODE_ENV === 'development') {
    return {
      queries: {
        // For development, let's use shorter stale times to make testing easier
        staleTime: 30 * 1000, // 30 seconds
      },
    };
  }
  
  return {};
};

// Create and export the QueryClient factory
export const createQueryClient = () => {
  // Create caches with error handlers
  const queryCache = new QueryCache({
    onError: defaultErrorHandler,
  });
  
  const mutationCache = new MutationCache({
    onError: defaultErrorHandler,
  });

  // Create client with caches and options
  const client = new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      ...defaultQueryOptions,
      ...getEnvironmentConfig(),
    },
  });

  return client;
}; 