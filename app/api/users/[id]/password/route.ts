import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/UserService';
import { AppError } from '@/lib/utils/error';
import { requireAuth } from '@/lib/middleware/auth';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { logRequest } from '@/lib/middleware/logger';
import { z } from 'zod';

const userService = new UserService();

// Validation schema
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8)
});

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
    const validatedData = updatePasswordSchema.parse(body);

    // Update password
    await userService.updatePassword(
      params.id,
      validatedData.currentPassword,
      validatedData.newPassword,
      session.user.role
    );

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
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