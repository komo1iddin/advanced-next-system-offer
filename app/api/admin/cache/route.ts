import { NextRequest, NextResponse } from "next/server";
import { getCache, cacheFactory } from "@/lib/services/CacheFactory";
import { getRedisClient } from "@/lib/config/redis";
import { requireAdmin } from "@/lib/middleware/auth";
import { z } from "zod";
import { redisCacheService } from "@/lib/services/RedisCacheService";

// Get the cache implementation
const cacheService = getCache();

// Schema for cache clear requests
const clearCacheSchema = z.object({
  pattern: z.string().optional(),
  type: z.enum(["all", "pattern"]).default("all"),
});

// Schema for cache key operations
const cacheKeySchema = z.object({
  key: z.string(),
  ttl: z.number().optional(),
});

/**
 * GET /api/admin/cache
 * Get cache statistics and status
 */
export async function GET(req: NextRequest) {
  console.log('[Cache API] Received GET request');
  
  try {
    // Check authentication and admin role
    console.log('[Cache API] Attempting to verify admin role');
    await requireAdmin(req);
    console.log('[Cache API] Admin role verified successfully');
    
    // Get cache statistics - use Redis service directly for stats
    console.log('[Cache API] Fetching cache statistics');
    let stats = {};
    try {
      stats = await redisCacheService.getStats() || {};
      console.log('[Cache API] Cache statistics fetched successfully');
    } catch (statsError) {
      console.error('[Cache API] Error fetching stats:', statsError);
      stats = { error: 'Failed to fetch statistics' };
    }
    
    // Check if Redis is available
    console.log('[Cache API] Checking Redis availability');
    let isRedisAvailable = false;
    try {
      isRedisAvailable = await cacheFactory.isRedisAvailable();
      console.log('[Cache API] Redis availability check completed:', isRedisAvailable);
    } catch (redisError) {
      console.error('[Cache API] Error checking Redis availability:', redisError);
    }
    
    // Get current implementation
    const implementation = isRedisAvailable ? "redis" : "memory";
    
    // Get Redis client info if available
    let redisInfo = null;
    if (isRedisAvailable) {
      try {
        console.log('[Cache API] Fetching Redis info');
        const redis = getRedisClient();
        redisInfo = await redis.info();
        console.log('[Cache API] Redis info fetched successfully');
      } catch (error) {
        console.error('[Cache API] Failed to get Redis info:', error);
      }
    }
    
    // Get TTL values
    let ttlValues = {
      short: 300,
      medium: 1800,
      long: 7200,
      day: 86400,
    };
    
    try {
      console.log('[Cache API] Fetching TTL values');
      ttlValues = {
        short: cacheService.getTTLValue("short"),
        medium: cacheService.getTTLValue("medium"),
        long: cacheService.getTTLValue("long"),
        day: cacheService.getTTLValue("day"),
      };
      console.log('[Cache API] TTL values fetched successfully');
    } catch (ttlError) {
      console.error('[Cache API] Error fetching TTL values:', ttlError);
    }
    
    console.log('[Cache API] Returning successful response');
    return NextResponse.json({
      success: true,
      stats,
      implementation,
      isRedisAvailable,
      redisInfo,
      ttlValues,
    });
  } catch (error) {
    console.error('[Cache API] Error in GET handler:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to get cache statistics",
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : null
      },
      { status: error instanceof Error && error.message.includes('Admin access required') ? 403 : 500 }
    );
  }
}

/**
 * POST /api/admin/cache
 * Clear cache or update cache settings
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin role
    await requireAdmin(req);
    
    const body = await req.json();
    const action = body.action;
    
    switch (action) {
      case "clear":
        return handleClearCache(body);
      case "get":
        return handleGetKey(body);
      case "set":
        return handleSetKey(body);
      case "delete":
        return handleDeleteKey(body);
      case "updateTTL":
        return handleUpdateTTL(body);
      case "warmup":
        return handleWarmupCache();
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing cache request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

/**
 * Handle clear cache requests
 */
async function handleClearCache(body: any) {
  try {
    const { type, pattern } = clearCacheSchema.parse(body);
    
    if (type === "all") {
      await cacheService.clear();
      return NextResponse.json({
        success: true,
        message: "Cache cleared successfully",
      });
    } else if (type === "pattern" && pattern) {
      await cacheService.clearPattern(pattern);
      return NextResponse.json({
        success: true,
        message: `Cache keys matching pattern '${pattern}' cleared successfully`,
      });
    } else {
      return NextResponse.json(
        { error: "Pattern is required when type is 'pattern'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}

/**
 * Handle get key requests
 */
async function handleGetKey(body: any) {
  try {
    const { key } = cacheKeySchema.parse(body);
    
    const value = await cacheService.get(key);
    const ttl = await getTTL(key);
    
    return NextResponse.json({
      success: true,
      key,
      value,
      ttl,
      exists: value !== null,
    });
  } catch (error) {
    console.error("Error getting cache key:", error);
    return NextResponse.json(
      { error: "Failed to get cache key" },
      { status: 500 }
    );
  }
}

/**
 * Handle set key requests
 */
async function handleSetKey(body: any) {
  try {
    const { key, value, ttl } = {
      ...cacheKeySchema.parse(body),
      value: body.value,
    };
    
    await cacheService.set(key, value, ttl);
    
    return NextResponse.json({
      success: true,
      message: `Cache key '${key}' set successfully`,
    });
  } catch (error) {
    console.error("Error setting cache key:", error);
    return NextResponse.json(
      { error: "Failed to set cache key" },
      { status: 500 }
    );
  }
}

/**
 * Handle delete key requests
 */
async function handleDeleteKey(body: any) {
  try {
    const { key } = cacheKeySchema.parse(body);
    
    await cacheService.del(key);
    
    return NextResponse.json({
      success: true,
      message: `Cache key '${key}' deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting cache key:", error);
    return NextResponse.json(
      { error: "Failed to delete cache key" },
      { status: 500 }
    );
  }
}

/**
 * Handle update TTL requests
 */
async function handleUpdateTTL(body: any) {
  try {
    const { key, ttl } = cacheKeySchema.parse(body);
    
    if (!ttl) {
      return NextResponse.json(
        { error: "TTL is required" },
        { status: 400 }
      );
    }
    
    // Check if the key exists
    const exists = await cacheService.exists(key);
    if (!exists) {
      return NextResponse.json(
        { error: `Cache key '${key}' not found` },
        { status: 404 }
      );
    }
    
    // Update TTL (Redis only)
    const redis = getRedisClient();
    await redis.expire(key, ttl);
    
    return NextResponse.json({
      success: true,
      message: `TTL for cache key '${key}' updated successfully`,
    });
  } catch (error) {
    console.error("Error updating TTL:", error);
    return NextResponse.json(
      { error: "Failed to update TTL" },
      { status: 500 }
    );
  }
}

/**
 * Handle warmup cache requests
 */
async function handleWarmupCache() {
  try {
    // Import services that have warmup methods
    const { StudyOfferService } = await import("@/lib/services/StudyOfferService");
    
    // Run warmup methods
    await StudyOfferService.warmCache();
    
    return NextResponse.json({
      success: true,
      message: "Cache warmup initiated successfully",
    });
  } catch (error) {
    console.error("Error warming up cache:", error);
    return NextResponse.json(
      { error: "Failed to warm up cache" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get TTL for a key
 */
async function getTTL(key: string): Promise<number> {
  try {
    const redis = getRedisClient();
    return await redis.ttl(key);
  } catch (error) {
    console.error("Error getting TTL:", error);
    return -1;
  }
} 