import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { ApiError } from './types';

/**
 * A hook that provides a standardized way to handle query errors
 * 
 * @returns A callback function that displays error messages in a consistent format
 */
export function useQueryErrorHandler<TError = Error>() {
  return useCallback((error: TError) => {
    // Default error message
    let errorMessage = 'An unexpected error occurred';
    let errorTitle = 'Error';
    
    // Handle ApiError
    if ((error as any)?.message) {
      errorMessage = (error as any).message;
    }
    
    // Handle API error response
    if ((error as ApiError)?.response?.data?.message) {
      errorMessage = (error as ApiError).response.data.message;
    }
    
    // Handle API error with status code
    if ((error as ApiError)?.response?.status) {
      const status = (error as ApiError).response.status;
      
      // Customize error title based on status code
      if (status === 401) {
        errorTitle = 'Authentication Error';
        errorMessage = errorMessage || 'Your session has expired. Please log in again.';
      } else if (status === 403) {
        errorTitle = 'Permission Denied';
        errorMessage = errorMessage || 'You do not have permission to access this resource.';
      } else if (status === 404) {
        errorTitle = 'Not Found';
        errorMessage = errorMessage || 'The requested resource was not found.';
      } else if (status >= 500) {
        errorTitle = 'Server Error';
        errorMessage = errorMessage || 'An unexpected server error occurred. Please try again later.';
      }
    }
    
    // Display toast notification with error message
    toast({
      title: errorTitle,
      description: errorMessage,
      variant: 'destructive',
    });
  }, []);
}

/**
 * Global error handler for React Query
 * 
 * This function can be used as a default error handler for all queries
 * in the React Query client settings.
 */
export const defaultQueryErrorHandler = (error: unknown) => {
  // Default error message
  let errorMessage = 'An unexpected error occurred';
  let errorTitle = 'Error';
  
  // Handle various error types
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if ((error as ApiError)?.response?.data?.message) {
    errorMessage = (error as ApiError).response.data.message;
    
    // Set error title based on status code
    const status = (error as ApiError).response.status;
    if (status === 401) errorTitle = 'Authentication Error';
    else if (status === 403) errorTitle = 'Permission Denied';
    else if (status === 404) errorTitle = 'Not Found';
    else if (status >= 500) errorTitle = 'Server Error';
  }
  
  // Display toast notification
  toast({
    title: errorTitle,
    description: errorMessage,
    variant: 'destructive',
  });
  
  // Log error to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Query error:', error);
  }
}; 