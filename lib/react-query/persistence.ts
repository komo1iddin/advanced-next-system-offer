import { QueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

// Keys for stored query data
const QUERY_CACHE_KEY = 'app_query_cache';
const QUERY_EXPIRY_KEY = 'app_query_expiry';

// Default expiry time (24 hours)
const DEFAULT_CACHE_EXPIRY = 24 * 60 * 60 * 1000;

/**
 * Configuration options for persistence
 */
export interface PersistenceOptions {
  key?: string;
  expiry?: number;
  include?: string[];
  exclude?: string[];
  serialize?: (data: any) => string;
  deserialize?: (data: string) => any;
}

/**
 * Serializes and stores the query cache in localStorage
 */
function persistQueryCache(
  queryClient: QueryClient,
  options: PersistenceOptions = {}
): void {
  const {
    key = QUERY_CACHE_KEY,
    expiry = DEFAULT_CACHE_EXPIRY,
    include,
    exclude,
    serialize = JSON.stringify,
  } = options;

  try {
    // Get the query cache
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();

    // Filter queries by include/exclude patterns
    const filteredQueries = queries.filter(query => {
      const queryKey = JSON.stringify(query.queryKey);
      
      // Check if the query should be included
      if (include?.length) {
        return include.some(pattern => queryKey.includes(pattern));
      }
      
      // Check if the query should be excluded
      if (exclude?.length) {
        return !exclude.some(pattern => queryKey.includes(pattern));
      }
      
      return true;
    });

    // Only persist if we have queries
    if (filteredQueries.length) {
      // Extract data from the filtered queries
      const persistedCache = filteredQueries.reduce((result, query) => {
        const queryKeyStr = JSON.stringify(query.queryKey);
        
        // Only add if we have data
        if (query.state.data !== undefined) {
          result[queryKeyStr] = {
            data: query.state.data,
            dataUpdatedAt: query.state.dataUpdatedAt,
          };
        }
        
        return result;
      }, {} as Record<string, any>);

      // Store the cache in localStorage
      localStorage.setItem(key, serialize(persistedCache));
      
      // Set expiry timestamp
      localStorage.setItem(
        QUERY_EXPIRY_KEY,
        JSON.stringify(Date.now() + expiry)
      );
    }
  } catch (error) {
    console.error('Failed to persist query cache:', error);
  }
}

/**
 * Restores the query cache from localStorage
 */
function restoreQueryCache(
  queryClient: QueryClient,
  options: PersistenceOptions = {}
): void {
  const {
    key = QUERY_CACHE_KEY,
    deserialize = JSON.parse,
  } = options;

  try {
    // Check if we have cached data
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return;

    // Check if cache has expired
    const expiryString = localStorage.getItem(QUERY_EXPIRY_KEY);
    if (expiryString) {
      const expiry = JSON.parse(expiryString);
      if (Date.now() > expiry) {
        // Cache has expired, clear it
        localStorage.removeItem(key);
        localStorage.removeItem(QUERY_EXPIRY_KEY);
        return;
      }
    }

    // Deserialize the cache
    const persistedCache = deserialize(cachedData);

    // Restore each query to the cache
    Object.entries(persistedCache).forEach(([queryKeyStr, value]) => {
      try {
        const queryKey = JSON.parse(queryKeyStr);
        const { data, dataUpdatedAt } = value as any;

        // Set query data in cache
        queryClient.setQueryData(queryKey, data, {
          updatedAt: dataUpdatedAt,
        });
      } catch (err) {
        console.error('Failed to restore query:', queryKeyStr, err);
      }
    });
  } catch (error) {
    console.error('Failed to restore query cache:', error);
  }
}

/**
 * Hook to persist and restore query cache between sessions
 */
export function usePersistQueries(
  queryClient: QueryClient,
  options: PersistenceOptions = {}
): void {
  // Keep track of setup status
  const isSetupComplete = useRef(false);

  useEffect(() => {
    if (isSetupComplete.current) return;

    // Restore the query cache on initial load
    restoreQueryCache(queryClient, options);
    isSetupComplete.current = true;

    // Set up listeners for caching on window events
    const saveCache = () => persistQueryCache(queryClient, options);

    // Save on window unload/hide
    window.addEventListener('beforeunload', saveCache);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        saveCache();
      }
    });

    // Set up internal caching on a regular interval
    const interval = setInterval(saveCache, 30000); // Every 30 seconds

    // Clean up
    return () => {
      window.removeEventListener('beforeunload', saveCache);
      document.removeEventListener('visibilitychange', saveCache);
      clearInterval(interval);
      
      // Save one last time on unmount
      saveCache();
    };
  }, [queryClient, options]);
}

/**
 * Clear the persisted query cache
 */
export function clearPersistentQueryCache(
  key: string = QUERY_CACHE_KEY
): void {
  localStorage.removeItem(key);
  localStorage.removeItem(QUERY_EXPIRY_KEY);
}

/**
 * Setup for persisting specific query based on key match patterns
 */
export function setupQueryPersistence(
  queryClient: QueryClient,
  options: PersistenceOptions = {}
): () => void {
  // Restore the query cache on initial call
  restoreQueryCache(queryClient, options);

  // Set up listeners for caching
  const saveCache = () => persistQueryCache(queryClient, options);

  // Save on window unload/hide
  window.addEventListener('beforeunload', saveCache);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveCache();
    }
  });

  // Initial save and set up interval saves
  saveCache();
  const interval = setInterval(saveCache, 60000); // Every minute

  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', saveCache);
    document.removeEventListener('visibilitychange', saveCache);
    clearInterval(interval);
  };
} 