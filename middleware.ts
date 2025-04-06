import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requestLogger } from '@/lib/middleware/logger';
import { defaultRateLimit } from '@/lib/middleware/rateLimit';

export async function middleware(request: NextRequest) {
  try {
    // Apply request logging
    const response = await requestLogger(request);

    // Apply rate limiting to all API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      await defaultRateLimit(request);
    }

    return response;
  } catch (error) {
    // If rate limit is exceeded, return 429
    if (error instanceof Error && error.message.includes('Too many requests')) {
      return NextResponse.json(
        { success: false, error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }

    // For other errors, continue with the request
    return NextResponse.next();
  }
}

// Define matcher to exclude NextAuth routes and static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 