import { NextRequest, NextResponse } from 'next/server';
import { StudyOfferService } from '@/lib/services/StudyOfferService';
import { ErrorHandler } from '@/lib/middleware/errorHandler';
import { ValidateRequest } from '@/lib/middleware/validateRequest';
import { ResponseFormatter } from '@/lib/middleware/responseFormatter';
import { studyOfferSchema } from '@/lib/validations/studyOfferSchema';
import { paramsSchema } from '@/lib/validations/paramsSchema';
import { requireAuth } from '@/lib/middleware/auth';
import { rateLimit } from '@/lib/middleware/rateLimit';

// GET a single study offer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    await rateLimit(request);

    // Validate route parameters
    const { id } = await ValidateRequest.validateParams(paramsSchema, params);

    // Get study offer by ID
    const studyOffer = await StudyOfferService.getStudyOfferById(id);

    if (!studyOffer) {
      return ResponseFormatter.notFound('Study offer not found');
    }

    // Return success response
    return ResponseFormatter.success(studyOffer);
  } catch (error) {
    return ErrorHandler.handle(error);
  }
}

// UPDATE a study offer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    await rateLimit(request);

    // Check authentication
    const user = await requireAuth(request);

    // Validate route parameters
    const { id } = await ValidateRequest.validateParams(paramsSchema, params);

    // Validate request body
    const data = await ValidateRequest.validateBody(studyOfferSchema, request);

    // Update study offer
    const studyOffer = await StudyOfferService.updateStudyOffer(id, data, user);

    if (!studyOffer) {
      return ResponseFormatter.notFound('Study offer not found');
    }

    // Return success response
    return ResponseFormatter.updated(studyOffer);
  } catch (error) {
    return ErrorHandler.handle(error);
  }
}

// DELETE a study offer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    await rateLimit(request);

    // Check authentication
    const user = await requireAuth(request);

    // Validate route parameters
    const { id } = await ValidateRequest.validateParams(paramsSchema, params);

    // Delete study offer
    const deleted = await StudyOfferService.deleteStudyOffer(id, user);

    if (!deleted) {
      return ResponseFormatter.notFound('Study offer not found');
    }

    // Return success response
    return ResponseFormatter.deleted();
  } catch (error) {
    return ErrorHandler.handle(error);
  }
} 