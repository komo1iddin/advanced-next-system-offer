import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/utils/error';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  const { windowMs, max, message = 'Too many requests, please try again later.' } = options;

  return async (req: NextRequest) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();

    // Clean up old entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }

    // Get or create rate limit entry
    const entry = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
    
    // Check if window has expired
    if (entry.resetTime < now) {
      entry.count = 0;
      entry.resetTime = now + windowMs;
    }

    // Check if limit exceeded
    if (entry.count >= max) {
      throw new AppError(429, message);
    }

    // Increment count
    entry.count++;
    rateLimitMap.set(ip, entry);

    // Add rate limit headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', max.toString());
    response.headers.set('X-RateLimit-Remaining', (max - entry.count).toString());
    response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());

    return response;
  };
};

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