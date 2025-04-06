import { NextRequest, NextResponse } from 'next/server';
import { logService } from '@/lib/services/LogService';

export const requestLogger = async (req: NextRequest) => {
  const start = Date.now();
  
  try {
    // Log the incoming request
    logService.logRequest(req);

    // Get the response
    const response = NextResponse.next();

    // Calculate response time
    const responseTime = Date.now() - start;

    // Log the response
    logService.logResponse(req, response, responseTime);

    // Add response time header
    response.headers.set('X-Response-Time', `${responseTime}ms`);

    return response;
  } catch (error) {
    logService.error('Error in request logger', { error });
    return NextResponse.next();
  }
}; 