import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { getCache, cacheFactory } from "@/lib/services/CacheFactory";
import { redisCacheService } from "@/lib/services/RedisCacheService";

// Get the cache implementation
const cacheService = getCache();

/**
 * GET /api/admin/test-redis
 * Test Redis cache functionality
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin role
    console.log('[Redis Test API] Attempting to verify admin role');
    await requireAdmin(req);
    console.log('[Redis Test API] Admin role verified successfully');
    
    // First, check Redis availability
    const isRedisAvailable = await cacheFactory.isRedisAvailable();
    console.log(`[Redis Test API] Redis available: ${isRedisAvailable}`);
    
    if (!isRedisAvailable) {
      return NextResponse.json({
        success: false,
        error: "Redis is not available. Please check Redis connection."
      }, { status: 500 });
    }
    
    // Generate unique test prefix for this run
    const testPrefix = `test:redis:${Date.now()}`;
    
    // Test #1: Basic set and get
    const basicKey = `${testPrefix}:basic`;
    const basicValue = { message: "Hello Redis!", timestamp: new Date().toISOString() };
    
    console.log(`[Redis Test API] Setting basic key: ${basicKey}`);
    await cacheService.set(basicKey, basicValue, 60); // 60 seconds TTL
    
    const retrievedBasicValue = await cacheService.get(basicKey);
    const basicTtl = await redisCacheService.getTTL(basicKey);
    const basicExists = await cacheService.exists(basicKey);
    
    console.log(`[Redis Test API] Retrieved basic value:`, retrievedBasicValue);
    console.log(`[Redis Test API] Basic TTL:`, basicTtl);
    console.log(`[Redis Test API] Basic key exists:`, basicExists);
    
    // Test #2: TTL Update
    const ttlKey = `${testPrefix}:ttl`;
    await cacheService.set(ttlKey, { updateTime: new Date().toISOString() }, 30);
    const originalTtl = await redisCacheService.getTTL(ttlKey);
    
    // Update TTL to 120 seconds
    await redisCacheService.updateTTL(ttlKey, 120);
    const updatedTtl = await redisCacheService.getTTL(ttlKey);
    
    console.log(`[Redis Test API] Original TTL: ${originalTtl}, Updated TTL: ${updatedTtl}`);
    
    // Test #3: Pattern matching and clearing
    // Create 5 keys with the same pattern
    const patternBase = `${testPrefix}:pattern:`;
    for (let i = 1; i <= 5; i++) {
      await cacheService.set(`${patternBase}${i}`, { index: i }, 60);
    }
    
    // Clear keys with pattern
    await cacheService.clearPattern(`${patternBase}*`);
    
    // Check if pattern keys were cleared
    const patternKeysExist = [];
    for (let i = 1; i <= 5; i++) {
      const exists = await cacheService.exists(`${patternBase}${i}`);
      patternKeysExist.push(exists);
    }
    
    console.log(`[Redis Test API] Pattern keys exist after clearing:`, patternKeysExist);
    
    // Test #4: Delete key
    const deleteKey = `${testPrefix}:delete`;
    await cacheService.set(deleteKey, { delete: true }, 60);
    const existsBeforeDelete = await cacheService.exists(deleteKey);
    
    await cacheService.del(deleteKey);
    const existsAfterDelete = await cacheService.exists(deleteKey);
    
    console.log(`[Redis Test API] Key exists before delete: ${existsBeforeDelete}, after delete: ${existsAfterDelete}`);
    
    // Return test results
    return NextResponse.json({
      success: true,
      redisAvailable: isRedisAvailable,
      implementation: isRedisAvailable ? "redis" : "memory",
      testResults: {
        basic: {
          key: basicKey,
          valueSet: basicValue,
          valueRetrieved: retrievedBasicValue,
          ttl: basicTtl,
          exists: basicExists,
          match: JSON.stringify(basicValue) === JSON.stringify(retrievedBasicValue)
        },
        ttlUpdate: {
          key: ttlKey,
          originalTtl,
          updatedTtl,
          success: updatedTtl > originalTtl
        },
        patternClear: {
          pattern: `${patternBase}*`,
          keysExistAfterClear: patternKeysExist,
          allCleared: patternKeysExist.every(exists => !exists)
        },
        deleteKey: {
          key: deleteKey,
          existsBeforeDelete,
          existsAfterDelete,
          success: existsBeforeDelete && !existsAfterDelete
        }
      }
    });
  } catch (error) {
    console.error('[Redis Test API] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to test Redis cache",
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : null
      },
      { status: error instanceof Error && error.message.includes('Admin access required') ? 403 : 500 }
    );
  }
} 