import { NextResponse } from 'next/server';
import { logService } from './LogService';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
}

interface QueryMetric {
  queryId: string;
  operation: string;
  collection: string;
  duration: number;
  status: 'success' | 'error';
  filters?: Record<string, any>;
  timestamp: number;
}

class MonitoringService {
  private static instance: MonitoringService;
  
  // Store metrics in memory with a sliding window (last 1000 metrics)
  private metrics: PerformanceMetric[] = [];
  private queryMetrics: QueryMetric[] = [];
  private errorCounts: Record<string, number> = {};
  private slowQueryThreshold = 500; // ms
  private criticalErrorThreshold = 5; // count in 5 minute window
  private metricsLimit = 1000;
  
  private constructor() {
    // Initialize metrics pruning interval
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.pruneOldMetrics(), 5 * 60 * 1000); // Every 5 minutes
    }
  }
  
  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }
  
  /**
   * Track a general performance metric
   */
  trackMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric = {
      ...metric,
      timestamp: Date.now()
    };
    
    this.metrics.push(fullMetric);
    
    // Keep metrics array limited to latest entries
    if (this.metrics.length > this.metricsLimit) {
      this.metrics = this.metrics.slice(-this.metricsLimit);
    }
    
    // Log slow operations
    if (metric.name === 'query_duration' && metric.value > this.slowQueryThreshold) {
      logService.warn(`Slow operation detected: ${metric.name}`, {
        value: metric.value,
        tags: metric.tags
      });
    }
  }
  
  /**
   * Track database query performance
   */
  trackQuery(metric: Omit<QueryMetric, 'timestamp'>): void {
    const fullMetric = {
      ...metric,
      timestamp: Date.now()
    };
    
    this.queryMetrics.push(fullMetric);
    
    // Keep query metrics array limited to latest entries
    if (this.queryMetrics.length > this.metricsLimit) {
      this.queryMetrics = this.queryMetrics.slice(-this.metricsLimit);
    }
    
    // Track as general metric as well
    this.trackMetric({
      name: `db.${metric.collection}.${metric.operation}`,
      value: metric.duration,
      tags: {
        collection: metric.collection,
        operation: metric.operation,
        status: metric.status
      }
    });
    
    // Log slow queries
    if (metric.duration > this.slowQueryThreshold) {
      logService.warn(`Slow query detected: ${metric.collection}.${metric.operation}`, {
        duration: metric.duration,
        filters: metric.filters
      });
    }
  }
  
  /**
   * Track error for monitoring and alerting
   */
  trackError(errorType: string, error: any): void {
    // Increment error count
    this.errorCounts[errorType] = (this.errorCounts[errorType] || 0) + 1;
    
    // Log error details
    logService.error(`${errorType} error:`, error);
    
    // Check for error threshold to trigger alerts
    const recentCount = this.errorCounts[errorType] || 0;
    if (recentCount >= this.criticalErrorThreshold) {
      this.triggerAlert(errorType, recentCount, error);
    }
  }
  
  /**
   * Get performance metrics for monitoring dashboard
   */
  getMetrics(type?: string, timeRange?: number): PerformanceMetric[] {
    const now = Date.now();
    const timeLimit = timeRange ? now - timeRange : 0;
    
    return this.metrics
      .filter(metric => 
        (!type || metric.name.includes(type)) && 
        metric.timestamp >= timeLimit
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  }
  
  /**
   * Get query metrics for database performance monitoring
   */
  getQueryMetrics(collection?: string, timeRange?: number): QueryMetric[] {
    const now = Date.now();
    const timeLimit = timeRange ? now - timeRange : 0;
    
    return this.queryMetrics
      .filter(metric => 
        (!collection || metric.collection === collection) && 
        metric.timestamp >= timeLimit
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  }
  
  /**
   * Get error statistics
   */
  getErrorStats(): Record<string, number> {
    return { ...this.errorCounts };
  }
  
  /**
   * Reset error counts (e.g., after alerting)
   */
  resetErrorCounts(errorType?: string): void {
    if (errorType) {
      delete this.errorCounts[errorType];
    } else {
      this.errorCounts = {};
    }
  }
  
  /**
   * Set slow query threshold
   */
  setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold;
  }
  
  /**
   * Remove old metrics to prevent memory growth
   */
  private pruneOldMetrics(): void {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    this.metrics = this.metrics.filter(metric => metric.timestamp >= oneHourAgo);
    this.queryMetrics = this.queryMetrics.filter(metric => metric.timestamp >= oneHourAgo);
    
    // Reset error counts older than 5 minutes
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    this.resetErrorCounts();
  }
  
  /**
   * Trigger an alert for critical errors
   */
  private triggerAlert(errorType: string, count: number, lastError: any): void {
    logService.error(`ALERT: Critical error threshold reached for ${errorType}`, {
      count,
      lastError
    });
    
    // Here you would implement external alerting system integration
    // For example, sending an email, SMS, or calling a webhook
    
    // Reset count after alert to prevent alert spam
    this.resetErrorCounts(errorType);
  }
}

// Export singleton instance
export const monitoringService = MonitoringService.getInstance();

/**
 * Higher-order function to track database query performance
 */
export function withPerformanceTracking<T>(
  promise: Promise<T>,
  options: {
    collection: string, 
    operation: string,
    queryId?: string,
    filters?: Record<string, any>
  }
): Promise<T> {
  const startTime = Date.now();
  const queryId = options.queryId || `query_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
  
  return promise.then(result => {
    const duration = Date.now() - startTime;
    
    monitoringService.trackQuery({
      queryId,
      duration,
      status: 'success',
      ...options
    });
    
    return result;
  }).catch(error => {
    const duration = Date.now() - startTime;
    
    monitoringService.trackQuery({
      queryId,
      duration,
      status: 'error',
      ...options
    });
    
    monitoringService.trackError(`db.${options.collection}.${options.operation}`, error);
    
    throw error;
  });
}

/**
 * Middleware to track API performance
 */
export function withApiPerformanceTracking(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    const startTime = Date.now();
    const url = new URL(req.url);
    const endpoint = url.pathname;
    
    try {
      const response = await handler(req, ...args);
      const duration = Date.now() - startTime;
      
      monitoringService.trackMetric({
        name: 'api.request',
        value: duration,
        tags: {
          endpoint,
          method: req.method,
          status: response.status.toString()
        }
      });
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      monitoringService.trackMetric({
        name: 'api.request',
        value: duration,
        tags: {
          endpoint,
          method: req.method,
          status: error instanceof Error ? '500' : '500'
        }
      });
      
      monitoringService.trackError('api.request', {
        endpoint,
        error
      });
      
      // Format and return error response
      return NextResponse.json(
        { 
          success: false,
          error: error instanceof Error ? error.message : "An unexpected error occurred", 
        },
        { status: 500 }
      );
    }
  };
}