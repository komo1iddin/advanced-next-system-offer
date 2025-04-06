import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/UserService';
import { AppError } from '@/lib/utils/error';
import { requireAuth } from '@/lib/middleware/auth';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { logRequest } from '@/lib/middleware/logger';
import { z } from 'zod';

const userService = new UserService();

// Validation schemas
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['super-admin', 'admin', 'manager', 'user']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  agentId: z.string().optional(),
  universityDirectId: z.string().optional()
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8)
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply middleware
    await logRequest(req);
    await rateLimit(req);
    const session = await requireAuth(req);

    // Get user
    const user = await userService.getUserById(params.id, session.user.role);

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply middleware
    await logRequest(req);
    await rateLimit(req);
    const session = await requireAuth(req);

    // Validate request body
    const body = await req.json();
    const validatedData = updateUserSchema.parse(body);

    // Update user
    const user = await userService.updateUser(params.id, validatedData, session.user.role);

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply middleware
    await logRequest(req);
    await rateLimit(req);
    const session = await requireAuth(req);

    // Delete user
    await userService.deleteUser(params.id, session.user.role);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 