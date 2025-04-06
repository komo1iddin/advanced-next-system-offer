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

export async function logRequest(req: NextRequest) {
  const start = Date.now();
  const { method, url } = req;
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  logService.info('Incoming request', {
    method,
    url,
    ip,
    timestamp: new Date().toISOString()
  });

  return {
    startTime: start,
    ip
  };
}

export async function logResponse(req: NextRequest, res: Response, context: { startTime: number; ip: string }) {
  const duration = Date.now() - context.startTime;
  const { method, url } = req;
  const status = res.status;

  logService.info('Request completed', {
    method,
    url,
    status,
    duration,
    ip: context.ip,
    timestamp: new Date().toISOString()
  });
} 