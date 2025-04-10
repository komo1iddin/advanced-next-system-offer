import { NextRequest, NextResponse } from 'next/server';
import { StudyOfferService } from '@/lib/services/StudyOfferService';
import { ErrorHandler } from '@/lib/middleware/errorHandler';
import { ValidateRequest } from '@/lib/middleware/validateRequest';
import { ResponseFormatter } from '@/lib/middleware/responseFormatter';
import { createStudyOfferSchema, studyOfferSchema } from '@/lib/validations/study-offer-schema';
import { studyOfferQuerySchema } from '@/lib/validations/query-schema';
import { requireAuth } from '@/lib/middleware/auth';
import { rateLimit } from '@/lib/middleware/rateLimit';
import connectToDatabase from '@/lib/mongodb';

interface StudyOfferResult {
  data: any[];
  total: number;
  timestamp?: string;
}

// Warm the cache on server startup for frequently accessed data
StudyOfferService.warmCache().catch(err => {
  console.error('Failed to warm study offers cache:', err);
});

// GET all study offers
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    await rateLimit(request);

    // Validate query parameters
    const query = await ValidateRequest.validateQuery(studyOfferQuerySchema, request);

    // Ensure database connection is established before proceeding
    await connectToDatabase();

    // Get study offers with pagination
    console.log(`Fetching study offers with query:`, JSON.stringify(query));
    const startTime = Date.now();

    try {
      const result = await StudyOfferService.getStudyOffers(query) as StudyOfferResult;
      
      const duration = Date.now() - startTime;
      console.log(`Query completed in ${duration}ms`);
      
      if (!result) {
        return ResponseFormatter.success([], 'No data found');
      }
      
      const { data = [], total = 0 } = result;

      // Return paginated response
      return ResponseFormatter.paginated(data, total, query.page, query.limit);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Query failed after ${duration}ms:`, error);
      
      // Handle timeout errors specifically
      if (error instanceof Error && error.message.includes('timeout')) {
        return NextResponse.json(
          { 
            error: "Database operation timed out. Please try again later or refine your search criteria.",
            status: 504,
            success: false,
            reason: "The query might be too complex or the database is under heavy load."
          }, 
          { status: 504 }
        );
      }
      
      throw error; // re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Error in GET /api/study-offers:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { 
          error: "Invalid query parameters",
          status: 400,
          success: false 
        }, 
        { status: 400 }
      );
    }
    
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
    console.log('User authenticated');

    // Ensure database connection is established before proceeding
    await connectToDatabase();

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
    
    // Handle timeout errors specifically
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { 
          error: "Database operation timed out. Please try again later.",
          status: 504,
          success: false 
        }, 
        { status: 504 }
      );
    }
    
    return ErrorHandler.handle(error);
  }
} 