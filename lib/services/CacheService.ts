import { AppError } from '@/lib/utils/error';

// Simple in-memory cache for Edge Runtime
class InMemoryCache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  // Cache statistics for monitoring performance
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
  };

  // Run cache maintenance periodically (clear expired items)
  constructor() {
    // Set up periodic cache cleanup every 5 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanupExpiredItems(), 5 * 60 * 1000);
    }
  }

  // Cleanup expired cache items to free memory
  private cleanupExpiredItems(): void {
    const now = Date.now();
    let evictionCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry > 0 && item.expiry < now) {
        this.cache.delete(key);
        evictionCount++;
      }
    }
    
    if (evictionCount > 0) {
      this.stats.evictions += evictionCount;
      console.log(`Cache cleanup: removed ${evictionCount} expired items`);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check if the item has expired
    if (item.expiry > 0 && item.expiry < Date.now()) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value as T;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiry = ttl ? Date.now() + ttl * 1000 : 0;
    this.cache.set(key, { value, expiry });
    this.stats.sets++;
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clearPattern(pattern: string): Promise<void> {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      const deletedKeys: string[] = [];
      
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
          deletedKeys.push(key);
        }
      }
      
      if (deletedKeys.length > 0) {
        console.log(`Cleared ${deletedKeys.length} cache keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.error(`Error clearing cache pattern ${pattern}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    
    if (!item) return false;
    
    // Check if the item has expired
    if (item.expiry > 0 && item.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Get cache stats for monitoring
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  // Clear all cache entries
  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`Cleared entire cache (${size} items)`);
  }
  
  // Get cache size
  size(): number {
    return this.cache.size;
  }
}

class CacheService {
  private cache: InMemoryCache;
  private static instance: CacheService;
  // Default TTL values for different types of data
  private readonly DEFAULT_TTLs = {
    short: 60, // 1 minute
    medium: 300, // 5 minutes
    long: 3600, // 1 hour
    day: 86400, // 24 hours
  };

  private constructor() {
    this.cache = new InMemoryCache();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.cache.get<T>(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      // If no TTL is provided, use medium TTL
      const effectiveTtl = ttl ?? this.DEFAULT_TTLs.medium;
      await this.cache.set(key, value, effectiveTtl);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cache.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async clearPattern(pattern: string): Promise<void> {
    try {
      await this.cache.clearPattern(pattern);
    } catch (error) {
      console.error('Cache clear pattern error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return await this.cache.exists(key);
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Get cache statistics
  getStats() {
    try {
      return this.cache.getStats();
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }

  // Clear entire cache
  async clear(): Promise<void> {
    try {
      await this.cache.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Cache warming function for common data
  async warmupCache(keyValuePairs: Array<{ key: string; fetch: () => Promise<any>; ttl?: number }>): Promise<void> {
    try {
      console.log(`Warming up cache with ${keyValuePairs.length} items...`);
      
      const results = await Promise.allSettled(
        keyValuePairs.map(async ({ key, fetch, ttl }) => {
          // Skip if already in cache
          if (await this.exists(key)) return;
          
          try {
            const data = await fetch();
            await this.set(key, data, ttl);
          } catch (error) {
            console.error(`Failed to warm cache for key ${key}:`, error);
          }
        })
      );
      
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      console.log(`Cache warmup complete: ${succeeded}/${keyValuePairs.length} succeeded`);
    } catch (error) {
      console.error('Cache warmup error:', error);
    }
  }

  // Get TTL constants
  getTTL(type: keyof CacheService['DEFAULT_TTLs'] = 'medium'): number {
    return this.DEFAULT_TTLs[type];
  }
}

export const cacheService = CacheService.getInstance(); 