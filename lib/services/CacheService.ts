import { AppError } from '@/lib/utils/error';
import { TTLType } from './CacheFactory';
import { monitoringService } from './MonitoringService';

// Simple in-memory cache for Edge Runtime
class InMemoryCache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  // Cache statistics for monitoring performance
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
    keys: 0,
    hitRatio: 0,
  };

  // Run cache maintenance periodically (clear expired items)
  constructor() {
    // Set up periodic cache cleanup every 5 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanupExpiredItems(), 5 * 60 * 1000);
      // Update hit ratio periodically
      setInterval(() => this.calculateHitRatio(), 60 * 1000);
    }
  }

  // Set cache item with expiry time
  set<T>(key: string, value: T, ttl: number): void {
    const now = Date.now();
    const expiry = now + ttl * 1000;
    this.cache.set(key, { value, expiry });
    this.stats.sets++;
    this.stats.keys = this.cache.size;
    
    // Track cache set operation in monitoring service
    monitoringService.trackMetric({
      name: 'cache.set',
      value: 1,
      tags: {
        cacheType: 'memory',
        ttl: ttl.toString()
      }
    });
  }

  // Get cache item if exists and not expired
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    const now = Date.now();

    if (!item) {
      this.stats.misses++;
      // Track cache miss in monitoring service
      monitoringService.trackMetric({
        name: 'cache.miss',
        value: 1,
        tags: { cacheType: 'memory' }
      });
      return null;
    }

    // Check if expired
    if (now > item.expiry) {
      this.stats.evictions++;
      this.cache.delete(key);
      this.stats.keys = this.cache.size;
      this.stats.misses++;
      
      // Track cache miss (expired) in monitoring service
      monitoringService.trackMetric({
        name: 'cache.miss',
        value: 1,
        tags: { 
          cacheType: 'memory',
          reason: 'expired'
        }
      });
      
      return null;
    }

    this.stats.hits++;
    // Track cache hit in monitoring service
    monitoringService.trackMetric({
      name: 'cache.hit',
      value: 1,
      tags: { cacheType: 'memory' }
    });
    
    return item.value as T;
  }

  // Delete item from cache
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.keys = this.cache.size;
      
      // Track cache deletion in monitoring service
      monitoringService.trackMetric({
        name: 'cache.delete',
        value: 1,
        tags: { cacheType: 'memory' }
      });
    }
    return deleted;
  }

  // Delete items by pattern (prefix)
  deleteByPattern(pattern: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      this.stats.keys = this.cache.size;
      
      // Track pattern deletion in monitoring service
      monitoringService.trackMetric({
        name: 'cache.deletePattern',
        value: count,
        tags: { 
          cacheType: 'memory',
          pattern
        }
      });
    }
    
    return count;
  }

  // Delete all items from cache
  clear(): void {
    const count = this.cache.size;
    this.cache.clear();
    this.stats.keys = 0;
    
    // Track cache clear in monitoring service
    monitoringService.trackMetric({
      name: 'cache.clear',
      value: count,
      tags: { cacheType: 'memory' }
    });
  }

  // Clean up expired items
  cleanupExpiredItems(): void {
    const now = Date.now();
    let evicted = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        evicted++;
      }
    }
    
    if (evicted > 0) {
      this.stats.evictions += evicted;
      this.stats.keys = this.cache.size;
      
      // Track cache cleanup in monitoring service
      monitoringService.trackMetric({
        name: 'cache.cleanup',
        value: evicted,
        tags: { cacheType: 'memory' }
      });
    }
  }

  // Calculate and update hit ratio
  calculateHitRatio(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRatio = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    // Track hit ratio in monitoring
    monitoringService.trackMetric({
      name: 'cache.hitRatio',
      value: this.stats.hitRatio,
      tags: { cacheType: 'memory' }
    });
  }

  // Get cache stats for monitoring
  getStats(): typeof this.stats {
    // Calculate latest hit ratio
    this.calculateHitRatio();
    return { ...this.stats };
  }
}

class CacheService {
  private cache: InMemoryCache;
  private static instance: CacheService;
  // Default TTL values for different types of data
  private readonly DEFAULT_TTLs = {
    short: parseInt(process.env.REDIS_TTL_SHORT || '300', 10),    // 5 min
    medium: parseInt(process.env.REDIS_TTL_MEDIUM || '1800', 10), // 30 min
    long: parseInt(process.env.REDIS_TTL_LONG || '7200', 10),     // 2 hours
    day: parseInt(process.env.REDIS_TTL_DAY || '86400', 10),      // 24 hours
  };
  
  // Track dependent keys for invalidation
  private keyDependencies: Map<string, Set<string>> = new Map();

  private constructor() {
    this.cache = new InMemoryCache();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Set value in cache with TTL
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const effectiveTTL = ttl || this.DEFAULT_TTLs.medium;
      this.cache.set(key, value, effectiveTTL);
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  // Set value with dependencies for smart invalidation
  async setWithDependencies<T>(
    key: string, 
    value: T, 
    dependencies: string[], 
    ttl?: number
  ): Promise<void> {
    try {
      // Store the value in cache
      await this.set(key, value, ttl);
      
      // Register dependencies for later invalidation
      dependencies.forEach(dep => {
        if (!this.keyDependencies.has(dep)) {
          this.keyDependencies.set(dep, new Set());
        }
        this.keyDependencies.get(dep)?.add(key);
      });
    } catch (error) {
      console.error('Error setting cache with dependencies:', error);
    }
  }

  // Get value from cache
  async get<T>(key: string): Promise<T | null> {
    try {
      return this.cache.get<T>(key);
    } catch (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
  }

  // Delete cache entry
  async delete(key: string): Promise<boolean> {
    try {
      return this.cache.delete(key);
    } catch (error) {
      console.error('Error deleting from cache:', error);
      return false;
    }
  }

  // Invalidate a key and all its dependents
  async invalidate(key: string): Promise<void> {
    try {
      // Delete the key itself
      await this.delete(key);
      
      // Find and delete dependent keys
      const dependents = this.keyDependencies.get(key);
      if (dependents && dependents.size > 0) {
        const promises = Array.from(dependents).map(depKey => this.delete(depKey));
        await Promise.all(promises);
        
        // Track cascade invalidation
        monitoringService.trackMetric({
          name: 'cache.invalidateCascade',
          value: dependents.size,
          tags: { 
            cacheType: 'memory',
            sourceKey: key
          }
        });
      }
      
      // Clear the dependency tracking for this key
      this.keyDependencies.delete(key);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  // Delete by pattern (prefix)
  async deleteByPattern(pattern: string): Promise<number> {
    try {
      return this.cache.deleteByPattern(pattern);
    } catch (error) {
      console.error('Error deleting by pattern from cache:', error);
      return 0;
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    try {
      this.cache.clear();
      // Also clear dependencies
      this.keyDependencies.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Get TTL value based on type
  getTTLValue(type: TTLType | string = 'medium'): number {
    const ttlMap = {
      short: this.DEFAULT_TTLs.short,
      medium: this.DEFAULT_TTLs.medium,
      long: this.DEFAULT_TTLs.long,
      day: this.DEFAULT_TTLs.day,
    };
    return ttlMap[type as TTLType] || ttlMap.medium;
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
  
  // Cache warming for frequently accessed data
  async warmCache(keyPatterns: { key: string, fetch: () => Promise<any>, ttl?: number }[]): Promise<void> {
    try {
      // Process each key in parallel
      await Promise.all(
        keyPatterns.map(async ({ key, fetch, ttl }) => {
          try {
            // Check if already cached
            const existing = await this.get(key);
            if (existing) return;
            
            // Fetch and cache the data
            const data = await fetch();
            await this.set(key, data, ttl);
            
            // Track cache warming
            monitoringService.trackMetric({
              name: 'cache.warm',
              value: 1,
              tags: { 
                cacheType: 'memory',
                key
              }
            });
          } catch (error) {
            console.error(`Error warming cache for key ${key}:`, error);
          }
        })
      );
    } catch (error) {
      console.error('Error in cache warming:', error);
    }
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance(); 