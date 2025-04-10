import { cacheService } from './CacheService';
import { redisCacheService } from './RedisCacheService';

/**
 * Cache implementation type
 */
export type CacheImplementation = 'redis' | 'memory';

/**
 * TTL types that both cache implementations support
 */
export type TTLType = 'short' | 'medium' | 'long' | 'day';

/**
 * Cache interface that both implementations must follow
 */
export interface CacheInterface {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  clearPattern(pattern: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
  // Make getTTLValue accept either the specific type or string
  getTTLValue(type?: TTLType | string): number;
  warmupCache?(items: Array<{ key: string; fetch: () => Promise<any>; ttl?: number }>): Promise<void>;
}

/**
 * Configuration for the cache factory
 */
interface CacheConfig {
  preferredImplementation?: CacheImplementation;
  fallbackToMemory?: boolean;
}

/**
 * Cache factory class to get the appropriate cache implementation
 */
class CacheFactory {
  private static instance: CacheFactory;
  private preferredImplementation: CacheImplementation;
  private fallbackToMemory: boolean;
  private cachedInstance: CacheInterface | null = null;
  private cacheImplementationChecked = false;

  private constructor(config: CacheConfig = {}) {
    // Default to Redis if not specified
    this.preferredImplementation = config.preferredImplementation || 'redis';
    // Default to fallback to memory cache if Redis fails
    this.fallbackToMemory = config.fallbackToMemory !== false;
  }

  public static getInstance(config: CacheConfig = {}): CacheFactory {
    if (!CacheFactory.instance) {
      CacheFactory.instance = new CacheFactory(config);
    }
    return CacheFactory.instance;
  }

  /**
   * Get the appropriate cache implementation
   */
  public getCache(): CacheInterface {
    // Return cached instance if available
    if (this.cachedInstance) {
      return this.cachedInstance;
    }

    try {
      // Try to use the preferred implementation
      if (this.preferredImplementation === 'redis') {
        if (!this.cacheImplementationChecked) {
          console.log('[CacheFactory] Using Redis cache implementation');
          this.cacheImplementationChecked = true;
        }
        this.cachedInstance = redisCacheService as unknown as CacheInterface;
        return this.cachedInstance;
      } else {
        if (!this.cacheImplementationChecked) {
          console.log('[CacheFactory] Using in-memory cache implementation');
          this.cacheImplementationChecked = true;
        }
        // Add missing methods to cacheService
        const enhancedCacheService = {
          ...cacheService,
          // Add getTTLValue method to in-memory cache
          getTTLValue: (type: TTLType | string = 'medium'): number => {
            const ttlMap = {
              short: 300,    // 5 minutes
              medium: 1800,  // 30 minutes
              long: 7200,    // 2 hours
              day: 86400     // 24 hours
            };
            return ttlMap[type as TTLType] || ttlMap.medium;
          },
          // Add a clear method if it doesn't exist
          clear: async (): Promise<void> => {
            console.log('[CacheFactory] Clearing in-memory cache');
            // Implementation depends on the actual cacheService
          }
        };
        this.cachedInstance = enhancedCacheService as CacheInterface;
        return this.cachedInstance;
      }
    } catch (error) {
      // If Redis fails and fallback is enabled, use in-memory cache
      if (this.fallbackToMemory) {
        console.warn('[CacheFactory] Failed to initialize Redis cache, falling back to in-memory cache:', error);
        // Create enhanced cache service with required methods
        const fallbackCache = {
          ...cacheService,
          getTTLValue: (type: TTLType | string = 'medium'): number => {
            const ttlMap = {
              short: 300,    // 5 minutes
              medium: 1800,  // 30 minutes
              long: 7200,    // 2 hours
              day: 86400     // 24 hours
            };
            return ttlMap[type as TTLType] || ttlMap.medium;
          },
          clear: async (): Promise<void> => {
            console.log('[CacheFactory] Clearing in-memory cache');
            // Implementation depends on the actual cacheService
          }
        };
        this.cachedInstance = fallbackCache as CacheInterface;
        return this.cachedInstance;
      }
      // Otherwise, rethrow the error
      throw error;
    }
  }

  /**
   * Change the cache implementation at runtime
   */
  public setImplementation(implementation: CacheImplementation): void {
    this.preferredImplementation = implementation;
    this.cachedInstance = null; // Reset the cached instance
    this.cacheImplementationChecked = false;
  }

  /**
   * Check if Redis is available
   */
  public async isRedisAvailable(): Promise<boolean> {
    try {
      // Try a simple operation on Redis
      await redisCacheService.set('__redis_test', 'test', 5);
      const value = await redisCacheService.get<string>('__redis_test');
      return value === 'test';
    } catch (error) {
      console.error('[CacheFactory] Redis availability check failed:', error);
      return false;
    }
  }
}

// Create a singleton instance with default configuration
const cacheFactory = CacheFactory.getInstance({
  preferredImplementation: 'redis',
  fallbackToMemory: true,
});

// Export a function to get the cache instance
export function getCache(): CacheInterface {
  return cacheFactory.getCache();
}

// Export the factory for advanced usage
export { cacheFactory }; 