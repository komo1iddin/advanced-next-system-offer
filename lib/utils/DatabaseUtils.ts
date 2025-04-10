import { AppError } from './AppError';
import { monitoringService } from '@/lib/services/MonitoringService';
import { withCircuitBreaker } from './CircuitBreaker';

/**
 * Execute a database operation with timeout protection
 * @param promise The database operation to execute
 * @param timeout Timeout in milliseconds (defaults to 10000ms)
 * @param timeoutMessage Custom timeout message
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeout: number = 10000,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  // Create a timeout promise that rejects after the specified time
  const timeoutPromise = new Promise<T>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      const error = new AppError(timeoutMessage, 504, 'TIMEOUT');
      
      // Track timeout in monitoring service
      monitoringService.trackMetric({
        name: 'db.timeout',
        value: timeout,
        tags: {
          message: timeoutMessage
        }
      });
      
      reject(error);
    }, timeout);
  });

  // Race the original promise against the timeout
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Execute a database query with timeout and circuit breaker protection
 */
export async function withProtectedQuery<T>(
  queryFn: () => Promise<T>,
  options: {
    collection: string;
    operation: string;
    timeout?: number;
    circuitBreakerName?: string;
    queryId?: string;
    filters?: Record<string, any>;
  }
): Promise<T> {
  const {
    collection,
    operation,
    timeout = 10000,
    circuitBreakerName,
    queryId,
    filters
  } = options;
  
  // Generate a unique ID for this query for tracking
  const queryTrackingId = queryId || `${collection}_${operation}_${Date.now()}`;
  
  const startTime = Date.now();
  
  try {
    // Apply circuit breaker if name is provided
    const executionFn = circuitBreakerName
      ? () => withTimeout(queryFn(), timeout, `${collection}.${operation} operation timed out after ${timeout}ms`)
      : () => withTimeout(queryFn(), timeout, `${collection}.${operation} operation timed out after ${timeout}ms`);
    
    // Execute with circuit breaker if name is provided, otherwise just with timeout
    const result = circuitBreakerName
      ? await withCircuitBreaker(executionFn, circuitBreakerName)
      : await executionFn();
    
    // Track successful query
    const duration = Date.now() - startTime;
    monitoringService.trackQuery({
      queryId: queryTrackingId,
      collection,
      operation,
      duration,
      status: 'success',
      filters
    });
    
    return result;
  } catch (error) {
    // Track failed query
    const duration = Date.now() - startTime;
    monitoringService.trackQuery({
      queryId: queryTrackingId,
      collection,
      operation,
      duration,
      status: 'error',
      filters
    });
    
    // Rethrow the error
    throw error;
  }
}

/**
 * Retry a database operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    retryableErrors?: string[];
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 500,
    maxDelay = 10000,
    retryableErrors,
    onRetry
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Check if we should retry for this error
      if (
        retryableErrors &&
        !retryableErrors.some(pattern => 
          lastError.message.includes(pattern) ||
          lastError.name.includes(pattern)
        )
      ) {
        // Not a retryable error
        throw lastError;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Calculate backoff delay with jitter
      const jitter = Math.random() * 0.3 + 0.85; // 0.85-1.15
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) * jitter,
        maxDelay
      );
      
      // Track retry metrics
      monitoringService.trackMetric({
        name: 'db.retry',
        value: attempt + 1,
        tags: {
          errorType: lastError.name,
          errorMessage: lastError.message.substring(0, 50)
        }
      });
      
      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }
      
      // Wait for the backoff period
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never happen, but TypeScript requires a return
  throw lastError!;
}

/**
 * Execute a database operation with complete protection (timeout, circuit breaker, and retry)
 */
export async function withProtectedDatabaseOperation<T>(
  operation: () => Promise<T>,
  options: {
    collection: string;
    operation: string;
    timeout?: number;
    circuitBreakerName?: string;
    maxRetries?: number;
    retryableErrors?: string[];
    filters?: Record<string, any>;
  }
): Promise<T> {
  const {
    collection,
    operation: operationName,
    timeout = 10000,
    circuitBreakerName,
    maxRetries = 3,
    retryableErrors = ['ECONNRESET', 'ETIMEDOUT', 'disconnect', 'timeout'],
    filters
  } = options;
  
  // Track query start
  const queryId = `${collection}_${operationName}_${Date.now()}`;
  
  return withRetry(
    () => withProtectedQuery(
      operation,
      {
        collection,
        operation: operationName,
        timeout,
        circuitBreakerName,
        queryId,
        filters
      }
    ),
    {
      maxRetries,
      retryableErrors,
      onRetry: (attempt, error) => {
        console.warn(`Retrying ${collection}.${operationName} (attempt ${attempt}/${maxRetries}) after error:`, error.message);
      }
    }
  );
} 