import { NextRequest } from 'next/server';
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

export async function rateLimit(req: NextRequest, config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  const now = Date.now();
  const windowStart = now - finalConfig.windowMs;

  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitStore.delete(key);
    }
  }

  // Get or initialize the rate limit entry
  let entry = rateLimitStore.get(ip);
  if (!entry) {
    entry = { count: 0, resetTime: now + finalConfig.windowMs };
    rateLimitStore.set(ip, entry);
  }

  // Check if the window has reset
  if (entry.resetTime < now) {
    entry.count = 0;
    entry.resetTime = now + finalConfig.windowMs;
  }

  // Increment the counter
  entry.count++;

  // Check if the limit has been exceeded
  if (entry.count > finalConfig.max) {
    logService.warn('Rate limit exceeded', { ip, count: entry.count });
    throw new AppError(429, finalConfig.message);
  }

  // Add rate limit headers to the response
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', finalConfig.max.toString());
  headers.set('X-RateLimit-Remaining', (finalConfig.max - entry.count).toString());
  headers.set('X-RateLimit-Reset', entry.resetTime.toString());

  return headers;
}

// Default rate limiters
export const defaultRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50 // 50 requests per window
});

export const adminRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000 // 1000 requests per window
}); 