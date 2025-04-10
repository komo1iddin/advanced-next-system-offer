import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/auth-utils";
import { monitoringService } from "@/lib/services/MonitoringService";
import { circuitBreakerRegistry } from "@/lib/utils/CircuitBreaker";
import { cacheService } from "@/lib/services/CacheService";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";
import { withApiPerformanceTracking } from "@/lib/services/MonitoringService";

/**
 * GET /api/admin/monitoring - Get system performance metrics
 */
export const GET = withApiPerformanceTracking(async (req: NextRequest) => {
  try {
    // Verify admin permissions
    await requireAdmin(req);
    
    // Get query parameters for filtering metrics
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const timeRange = searchParams.get('timeRange') 
      ? parseInt(searchParams.get('timeRange')!) 
      : 3600000; // Default to last hour
    const collection = searchParams.get('collection');
    
    // Gather metrics based on query parameters
    const metrics = {
      performance: monitoringService.getMetrics(type || undefined, timeRange),
      database: monitoringService.getQueryMetrics(collection || undefined, timeRange),
      errors: monitoringService.getErrorStats(),
      circuitBreakers: circuitBreakerRegistry.getAllStats(),
      cache: cacheService.getStats() || {},
      system: await getSystemMetrics(),
    };
    
    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Monitoring API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        stack: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.stack : null 
          : null
      },
      {
        status: error instanceof Error && error.message.includes('Admin access required') 
          ? 403 
          : 500
      }
    );
  }
});

/**
 * POST /api/admin/monitoring/reset-circuit - Reset a circuit breaker
 */
export const POST = withApiPerformanceTracking(async (req: NextRequest) => {
  try {
    // Verify admin permissions
    await requireAdmin(req);
    
    // Parse request body
    const body = await req.json();
    const { action, circuitName } = body;
    
    if (action === 'reset-circuit') {
      if (!circuitName) {
        return NextResponse.json(
          { success: false, error: 'Circuit name is required' },
          { status: 400 }
        );
      }
      
      const success = circuitBreakerRegistry.resetCircuit(circuitName);
      
      if (!success) {
        return NextResponse.json(
          { success: false, error: `Circuit '${circuitName}' not found` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: `Circuit '${circuitName}' has been reset`,
        newState: circuitBreakerRegistry.getOrCreate(circuitName).getStats()
      });
    } else if (action === 'reset-all-circuits') {
      circuitBreakerRegistry.resetAll();
      
      return NextResponse.json({
        success: true,
        message: 'All circuits have been reset',
        circuitBreakers: circuitBreakerRegistry.getAllStats()
      });
    } else if (action === 'clear-cache') {
      await cacheService.clear();
      
      return NextResponse.json({
        success: true,
        message: 'Cache has been cleared',
        cacheStats: cacheService.getStats()
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Monitoring API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        stack: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.stack : null 
          : null
      },
      {
        status: error instanceof Error && error.message.includes('Admin access required') 
          ? 403 
          : 500
      }
    );
  }
});

/**
 * Get system metrics including database status
 */
async function getSystemMetrics() {
  try {
    // Connect to database
    const conn = await connectToDatabase();
    
    // Get MongoDB connection stats
    const adminDb = conn.db.admin();
    const serverStatus = await adminDb.serverStatus();
    
    // Get collection stats for main collections
    const db = conn.db;
    const collectionsToCheck = ['studyOffers', 'users', 'universities'];
    
    const collectionStats = await Promise.all(
      collectionsToCheck.map(async (collName) => {
        try {
          const stats = await db.collection(collName).stats();
          return {
            name: collName,
            count: stats.count,
            size: stats.size,
            avgObjSize: stats.avgObjSize,
            storageSize: stats.storageSize,
            totalIndexSize: stats.totalIndexSize,
            indexSizes: stats.indexSizes
          };
        } catch (e) {
          return {
            name: collName,
            error: e instanceof Error ? e.message : 'Unknown error'
          };
        }
      })
    );
    
    // Get connection pool stats
    const poolStats = mongoose.connections.map(conn => ({
      name: conn.name,
      host: conn.host,
      port: conn.port,
      readyState: conn.readyState
    }));
    
    return {
      mongodb: {
        connections: {
          current: serverStatus.connections?.current || 0,
          available: serverStatus.connections?.available || 0,
          totalCreated: serverStatus.connections?.totalCreated || 0
        },
        memory: serverStatus.mem || {},
        network: serverStatus.network || {},
        collections: collectionStats,
        poolStats
      },
      node: {
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
  } catch (error) {
    console.error('Error getting system metrics:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to get system metrics'
    };
  }
}