import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/UserService';
import { AppError } from '@/lib/utils/error';
import { requireAuth } from '@/lib/middleware/auth';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { logRequest, logResponse } from '@/lib/middleware/logger';
import { z } from 'zod';

const userService = new UserService();

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['super-admin', 'admin', 'manager', 'user']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  agentId: z.string().optional(),
  universityDirectId: z.string().optional()
});

const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  role: z.enum(['super-admin', 'admin', 'manager', 'user']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  search: z.string().optional()
});

export async function GET(req: NextRequest) {
  let response: NextResponse;
  const context = await logRequest(req);

  try {
    // Apply rate limiting
    const rateLimitHeaders = await rateLimit(req);
    
    // Validate query parameters
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const validatedQuery = querySchema.parse(searchParams);

    // Parse pagination parameters
    const page = parseInt(validatedQuery.page || '1');
    const limit = parseInt(validatedQuery.limit || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (validatedQuery.role) query.role = validatedQuery.role;
    if (validatedQuery.status) query.status = validatedQuery.status;
    if (validatedQuery.search) {
      query.$or = [
        { firstName: { $regex: validatedQuery.search, $options: 'i' } },
        { lastName: { $regex: validatedQuery.search, $options: 'i' } },
        { email: { $regex: validatedQuery.search, $options: 'i' } }
      ];
    }

    // Get users with pagination
    const users = await userService.getUsers(query, skip, limit, 'super-admin'); // TODO: Get actual role from session
    const total = await userService.countUsers(query);

    response = NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

    // Add rate limit headers
    rateLimitHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
  } catch (error) {
    if (error instanceof AppError) {
      response = NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    } else {
      response = NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  await logResponse(req, response, context);
  return response;
}

export async function POST(req: NextRequest) {
  let response: NextResponse;
  const context = await logRequest(req);

  try {
    // Apply rate limiting
    const rateLimitHeaders = await rateLimit(req);
    
    // Validate request body
    const body = await req.json();
    const validatedData = createUserSchema.parse(body);

    // Create user
    const user = await userService.createUser(validatedData, 'super-admin'); // TODO: Get actual role from session

    response = NextResponse.json(
      { success: true, data: user },
      { status: 201 }
    );

    // Add rate limit headers
    rateLimitHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
  } catch (error) {
    if (error instanceof AppError) {
      response = NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    } else if (error instanceof z.ZodError) {
      response = NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    } else {
      response = NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  await logResponse(req, response, context);
  return response;
} 