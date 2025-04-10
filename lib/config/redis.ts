import Redis, { RedisOptions } from 'ioredis';

// Define Redis client options based on environment variables
const getRedisUrl = (): string => {
  // Use REDIS_URL environment variable or fallback to localhost
  return process.env.REDIS_URL || 'redis://localhost:6379';
};

// Configuration options for Redis client
const getRedisOptions = (): RedisOptions => {
  return {
    maxRetriesPerRequest: 3,
    enableAutoPipelining: true,
    connectTimeout: 10000, // 10 seconds
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 200, 2000); // Exponential backoff with max 2s delay
      return delay;
    },
    reconnectOnError: (err: Error) => {
      const targetErrors = [/READONLY/, /ETIMEDOUT/, /ECONNRESET/, /ECONNREFUSED/];
      // Only reconnect for specific errors
      return targetErrors.some((pattern) => pattern.test(err.message));
    },
  };
};

// Global client reference
let redis: Redis | null = null;

/**
 * Get a Redis client instance (singleton pattern)
 */
export const getRedisClient = (): Redis => {
  if (!redis) {
    const redisUrl = getRedisUrl();
    console.log(`[Redis] Connecting to ${redisUrl.replace(/redis:\/\/.*@/, 'redis://***@')}`);
    
    redis = new Redis(redisUrl, getRedisOptions());
    
    // Handle connection events
    redis.on('connect', () => {
      console.log('[Redis] Connection established');
    });
    
    redis.on('error', (err: Error) => {
      console.error('[Redis] Connection error:', err);
    });
    
    redis.on('close', () => {
      console.log('[Redis] Connection closed');
    });
    
    // Handle process termination
    process.on('beforeExit', () => {
      if (redis) {
        console.log('[Redis] Closing connection due to process exit');
        redis.disconnect();
      }
    });
  }
  
  return redis;
};

/**
 * Close the Redis connection
 */
export const closeRedisConnection = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log('[Redis] Connection closed');
  }
}; 