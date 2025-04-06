import { NextRequest, NextResponse } from 'next/server';
import { StudyOfferService } from '@/lib/services/StudyOfferService';
import { ErrorHandler } from '@/lib/middleware/errorHandler';
import { ValidateRequest } from '@/lib/middleware/validateRequest';
import { ResponseFormatter } from '@/lib/middleware/responseFormatter';
import { studyOfferSchema } from '@/lib/validations/studyOfferSchema';
import { querySchema } from '@/lib/validations/querySchema';
import { requireAuth } from '@/lib/middleware/auth';
import { rateLimit } from '@/lib/middleware/rateLimit';

// GET all study offers
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    await rateLimit(request);

    // Validate query parameters
    const query = await ValidateRequest.validateQuery(querySchema, request);

    // Get study offers with pagination
    const { data, total } = await StudyOfferService.getStudyOffers(query);

    // Return paginated response
    return ResponseFormatter.paginated(data, total, query.page, query.limit);
  } catch (error) {
    return ErrorHandler.handle(error);
  }
}

// POST a new study offer
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    await rateLimit(request);

    // Check authentication
    const user = await requireAuth(request);

    // Validate request body
    const data = await ValidateRequest.validateBody(studyOfferSchema, request);

    // Create study offer
    const studyOffer = await StudyOfferService.createStudyOffer(data, user);

    // Return success response
    return ResponseFormatter.created(studyOffer);
  } catch (error) {
    return ErrorHandler.handle(error);
  }
} 