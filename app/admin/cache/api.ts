/**
 * Cache API Service
 * Provides functions to interact with the cache API endpoints
 */

import { CacheKey, CacheStats, RedisInfo, TTLValues } from "./types";

/**
 * Fetch cache information from the API
 */
export async function fetchCacheInfo() {
  const response = await fetch("/api/admin/cache");
  
  if (!response.ok) {
    throw new Error(`Error fetching cache info: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Clear the entire cache
 */
export async function clearEntireCache() {
  const response = await fetch("/api/admin/cache", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "clear",
      type: "all",
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error clearing cache: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Clear cache keys matching a pattern
 */
export async function clearCachePattern(pattern: string) {
  if (!pattern) {
    throw new Error("Pattern is required");
  }
  
  const response = await fetch("/api/admin/cache", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "clear",
      type: "pattern",
      pattern,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error clearing pattern: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Get a cache key
 */
export async function getCacheKey(key: string) {
  if (!key) {
    throw new Error("Key is required");
  }
  
  const response = await fetch("/api/admin/cache", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "get",
      key,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error getting key: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Delete a cache key
 */
export async function deleteCacheKey(key: string) {
  if (!key) {
    throw new Error("Key is required");
  }
  
  const response = await fetch("/api/admin/cache", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "delete",
      key,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error deleting key: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Update TTL for a cache key
 */
export async function updateTTL(key: string, ttl: number) {
  if (!key) {
    throw new Error("Key is required");
  }
  
  if (isNaN(ttl) || ttl <= 0) {
    throw new Error("TTL must be a positive number");
  }
  
  const response = await fetch("/api/admin/cache", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "updateTTL",
      key,
      ttl: Number(ttl),
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error updating TTL: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Warm up the cache
 */
export async function warmupCache() {
  const response = await fetch("/api/admin/cache", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "warmup",
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error warming up cache: ${response.statusText}`);
  }
  
  return await response.json();
} 