import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '../utils/error';
import { logService } from '../services/LogService';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
};

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(req: NextRequest, config: Partial<RateLimitConfig> = {}): Promise<NextResponse | null> {
  const finalConfig = { ...defaultConfig, ...config };
  
  // Get IP from various headers or fallback to connection remote address
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 
             realIp ? realIp : 
             'unknown';

  const now = Date.now();
  const windowStart = now - finalConfig.windowMs;

  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitStore.delete(key);
    }
  }

  // Get or create entry for this IP
  let entry = rateLimitStore.get(ip);
  if (!entry || entry.resetTime < windowStart) {
    entry = { count: 0, resetTime: now + finalConfig.windowMs };
    rateLimitStore.set(ip, entry);
  }

  // Increment the counter
  entry.count++;

  // Check if the limit has been exceeded
  if (entry.count > finalConfig.max) {
    logService.warn('Rate limit exceeded', { ip, count: entry.count });
    throw new AppError(429, finalConfig.message || 'Too many requests');
  }

  // Create response with rate limit headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', finalConfig.max.toString());
  response.headers.set('X-RateLimit-Remaining', (finalConfig.max - entry.count).toString());
  response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());

  return response;
}

// Helper function to create rate limiters with specific configs
function createRateLimiter(config: RateLimitConfig) {
  return (req: NextRequest) => rateLimit(req, config);
}

// Default rate limiters
export const defaultRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

export const strictRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50 // 50 requests per window
});

export const adminRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000 // 1000 requests per window
}); 