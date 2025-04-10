import { getRedisClient } from '../config/redis';

/**
 * Redis-based cache service for distributed caching
 */
export class RedisCacheService {
  private static instance: RedisCacheService;
  // Default TTL values from environment variables or fallbacks
  private readonly DEFAULT_TTLs = {
    short: parseInt(process.env.REDIS_TTL_SHORT || '300', 10),    // 5 min
    medium: parseInt(process.env.REDIS_TTL_MEDIUM || '1800', 10), // 30 min
    long: parseInt(process.env.REDIS_TTL_LONG || '7200', 10),     // 2 hours
    day: parseInt(process.env.REDIS_TTL_DAY || '86400', 10),      // 24 hours
  };

  private constructor() {}

  public static getInstance(): RedisCacheService {
    if (!RedisCacheService.instance) {
      RedisCacheService.instance = new RedisCacheService();
    }
    return RedisCacheService.instance;
  }

  /**
   * Get a value from the cache
   * @param key - Cache key
   * @returns The cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedisClient();
      const value = await redis.get(key);
      
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('[RedisCacheService] Error getting cache:', error);
      return null;
    }
  }

  /**
   * Set a value in the cache with optional TTL
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (optional)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const redis = getRedisClient();
      const serializedValue = JSON.stringify(value);
      
      if (ttl) {
        await redis.setex(key, ttl, serializedValue);
      } else {
        // Use medium TTL as default
        await redis.setex(key, this.DEFAULT_TTLs.medium, serializedValue);
      }
    } catch (error) {
      console.error('[RedisCacheService] Error setting cache:', error);
    }
  }

  /**
   * Delete a value from the cache
   * @param key - Cache key
   */
  async del(key: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(key);
    } catch (error) {
      console.error('[RedisCacheService] Error deleting cache:', error);
    }
  }

  /**
   * Clear all cache keys matching a pattern
   * @param pattern - Redis glob pattern (e.g., "user:*")
   */
  async clearPattern(pattern: string): Promise<void> {
    try {
      const redis = getRedisClient();
      
      // Use SCAN instead of KEYS for production environments
      // to avoid blocking the Redis server
      let cursor = '0';
      let keys: string[] = [];
      
      do {
        const reply = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', '100');
        cursor = reply[0];
        keys = keys.concat(reply[1]);
      } while (cursor !== '0');
      
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`[RedisCacheService] Cleared ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.error(`[RedisCacheService] Error clearing pattern ${pattern}:`, error);
    }
  }

  /**
   * Check if a key exists in the cache
   * @param key - Cache key
   * @returns True if the key exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      return (await redis.exists(key)) > 0;
    } catch (error) {
      console.error('[RedisCacheService] Error checking if key exists:', error);
      return false;
    }
  }

  /**
   * Get cache stats
   * @returns Redis info
   */
  async getStats(): Promise<any> {
    try {
      const redis = getRedisClient();
      return await redis.info();
    } catch (error) {
      console.error('[RedisCacheService] Error getting stats:', error);
      return null;
    }
  }

  /**
   * Clear the entire cache
   * WARNING: This will clear all Redis keys! Use with caution.
   */
  async clear(): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.flushdb();
      console.log('[RedisCacheService] Cache cleared completely');
    } catch (error) {
      console.error('[RedisCacheService] Error clearing cache:', error);
    }
  }

  /**
   * Warm up the cache with multiple data items
   * @param items - Array of items to cache
   */
  async warmupCache(items: Array<{ key: string; fetch: () => Promise<any>; ttl?: number }>): Promise<void> {
    try {
      console.log(`[RedisCacheService] Warming up cache with ${items.length} items...`);
      
      const results = await Promise.allSettled(
        items.map(async ({ key, fetch, ttl }) => {
          // Skip if already in cache to prevent unnecessary fetches
          if (await this.exists(key)) {
            return { status: 'skipped', key };
          }
          
          try {
            const data = await fetch();
            await this.set(key, data, ttl);
            return { status: 'success', key };
          } catch (error) {
            console.error(`[RedisCacheService] Failed to warm cache for key ${key}:`, error);
            return { status: 'error', key, error };
          }
        })
      );
      
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      console.log(`[RedisCacheService] Cache warmup complete: ${succeeded}/${items.length} succeeded`);
    } catch (error) {
      console.error('[RedisCacheService] Cache warmup error:', error);
    }
  }

  /**
   * Get TTL for a specific key
   * @param key - Cache key
   * @returns TTL in seconds or -1 if key doesn't exist
   */
  async getTTL(key: string): Promise<number> {
    try {
      const redis = getRedisClient();
      return await redis.ttl(key);
    } catch (error) {
      console.error('[RedisCacheService] Error getting TTL:', error);
      return -1;
    }
  }

  /**
   * Update TTL for an existing key
   * @param key - Cache key
   * @param ttl - New TTL in seconds
   * @returns True if successful, false otherwise
   */
  async updateTTL(key: string, ttl: number): Promise<boolean> {
    try {
      const redis = getRedisClient();
      return await redis.expire(key, ttl) === 1;
    } catch (error) {
      console.error('[RedisCacheService] Error updating TTL:', error);
      return false;
    }
  }

  /**
   * Get TTL constants
   * @param type - TTL type (short, medium, long, day)
   * @returns TTL value in seconds
   */
  getTTLValue(type: keyof typeof this.DEFAULT_TTLs = 'medium'): number {
    return this.DEFAULT_TTLs[type];
  }
}

export const redisCacheService = RedisCacheService.getInstance(); 