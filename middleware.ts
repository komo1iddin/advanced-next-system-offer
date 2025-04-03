import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Just pass through all requests, letting NextAuth handle auth routes
  return NextResponse.next();
}

// Define matcher to exclude NextAuth routes and static files
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 