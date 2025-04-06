import { AppError } from '@/lib/utils/error';

// Simple in-memory cache for Edge Runtime
class InMemoryCache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiry = ttl ? Date.now() + ttl * 1000 : 0;
    this.cache.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clearPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key);
  }
}

class CacheService {
  private cache: InMemoryCache;
  private static instance: CacheService;

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
      await this.cache.set(key, value, ttl);
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
}

export const cacheService = CacheService.getInstance(); 