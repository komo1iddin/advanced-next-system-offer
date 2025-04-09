import { NextRequest, NextResponse } from 'next/server';
import { StudyOfferService } from '@/lib/services/StudyOfferService';
import { ErrorHandler } from '@/lib/middleware/errorHandler';
import { ValidateRequest } from '@/lib/middleware/validateRequest';
import { ResponseFormatter } from '@/lib/middleware/responseFormatter';
import { createStudyOfferSchema, studyOfferSchema } from '@/lib/validations/study-offer-schema';
import { studyOfferQuerySchema } from '@/lib/validations/query-schema';
import { requireAuth } from '@/lib/middleware/auth';
import { rateLimit } from '@/lib/middleware/rateLimit';

// GET all study offers
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    await rateLimit(request);

    // Validate query parameters
    const query = await ValidateRequest.validateQuery(studyOfferQuerySchema, request);

    // Get study offers with pagination
    const result = await StudyOfferService.getStudyOffers(query);
    const { data = [], total = 0 } = result || {};

    // Return paginated response
    return ResponseFormatter.paginated(data, total, query.page, query.limit);
  } catch (error) {
    return ErrorHandler.handle(error);
  }
}

// POST a new study offer
export async function POST(request: NextRequest) {
  try {
    console.log('Received request to create study offer');
    
    // Apply rate limiting
    await rateLimit(request);
    console.log('Rate limit check passed');

    // Check authentication
    const user = await requireAuth(request);
    console.log('User authenticated:', user?.email || 'unknown email');

    // Try to parse request body without validation first for debugging
    let rawBody;
    try {
      const clonedRequest = request.clone();
      rawBody = await clonedRequest.json();
      console.log('Raw request body received:', JSON.stringify(rawBody, null, 2));
    } catch (e) {
      console.error('Failed to parse raw request body:', e);
    }

    // Validate request body
    console.log('Validating request body with createStudyOfferSchema');
    const data = await ValidateRequest.validateBody(createStudyOfferSchema, request);
    console.log('Validation successful');

    // Create study offer
    console.log('Creating study offer with validated data');
    const studyOffer = await StudyOfferService.createStudyOffer(data, user);
    console.log('Study offer created successfully:', studyOffer?._id);

    // Return success response
    return ResponseFormatter.created(studyOffer);
  } catch (error) {
    console.error('Error in POST /api/study-offers:', error);
    return ErrorHandler.handle(error);
  }
} 