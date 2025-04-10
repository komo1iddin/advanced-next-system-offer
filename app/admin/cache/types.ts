/**
 * Type definitions for cache management
 */

/**
 * Cache statistics
 */
export interface CacheStats {
  hits?: number;
  misses?: number;
  sets?: number;
  evictions?: number;
  [key: string]: any;
}

/**
 * Redis information
 */
export interface RedisInfo {
  [key: string]: any;
}

/**
 * TTL values configuration
 */
export interface TTLValues {
  short: number;
  medium: number;
  long: number;
  day: number;
}

/**
 * Cache key with value and TTL
 */
export interface CacheKey {
  key: string;
  value: any;
  ttl: number;
  exists?: boolean;
}

/**
 * API response from cache endpoints
 */
export interface CacheApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  stats?: CacheStats;
  implementation?: string;
  isRedisAvailable?: boolean;
  redisInfo?: RedisInfo | null;
  ttlValues?: TTLValues;
  key?: string;
  value?: any;
  ttl?: number;
  exists?: boolean;
} 