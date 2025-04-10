/**
 * React Query hooks for cache management operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { CacheKey } from "./types";

/**
 * Cache query keys
 */
export const cacheKeys = {
  cacheInfo: ["cache-info"],
  cacheKey: (key: string) => ["cache-key", key],
};

/**
 * Hook for fetching cache information
 */
export function useCacheInfo() {
  return useQuery({
    queryKey: cacheKeys.cacheInfo,
    queryFn: api.fetchCacheInfo,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for clearing the entire cache
 */
export function useClearEntireCache() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.clearEntireCache,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKeys.cacheInfo });
    },
  });
}

/**
 * Hook for clearing cache keys matching a pattern
 */
export function useClearCachePattern() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.clearCachePattern,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKeys.cacheInfo });
    },
  });
}

/**
 * Hook for fetching a cache key
 */
export function useGetCacheKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.getCacheKey,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(cacheKeys.cacheKey(variables), data);
    },
  });
}

/**
 * Hook for deleting a cache key
 */
export function useDeleteCacheKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteCacheKey,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cacheKeys.cacheKey(variables) });
      queryClient.invalidateQueries({ queryKey: cacheKeys.cacheInfo });
    },
  });
}

/**
 * Hook for updating TTL for a cache key
 */
export function useUpdateTTL() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ key, ttl }: { key: string; ttl: number }) => api.updateTTL(key, ttl),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cacheKeys.cacheKey(variables.key) });
    },
  });
}

/**
 * Hook for warming up the cache
 */
export function useWarmupCache() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.warmupCache,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKeys.cacheInfo });
    },
  });
} 