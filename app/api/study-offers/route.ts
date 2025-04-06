import { NextRequest, NextResponse } from 'next/server';
import { StudyOfferService } from '@/lib/services/StudyOfferService';
import { errorHandler } from '@/lib/utils/error';
import { createStudyOfferSchema, getStudyOffersSchema } from '@/lib/validators/studyOffer.validator';
import { requireAdmin } from '@/lib/middleware/auth';
import { defaultRateLimit } from '@/lib/middleware/rateLimit';

const studyOfferService = new StudyOfferService();

// GET all study offers
export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting
    await defaultRateLimit(req);

    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    // Validate query parameters
    const validatedParams = getStudyOffersSchema.parse(params);
    
    // Build filters
    const filters: any = {};
    if (validatedParams.category) filters.category = validatedParams.category;
    if (validatedParams.degreeLevel) filters.degreeLevel = validatedParams.degreeLevel;
    if (validatedParams.featured === 'true') filters.featured = true;
    if (validatedParams.uniqueId) filters.uniqueId = validatedParams.uniqueId;
    if (validatedParams.search) {
      filters.$or = [
        { title: { $regex: validatedParams.search, $options: 'i' } },
        { description: { $regex: validatedParams.search, $options: 'i' } },
        { universityName: { $regex: validatedParams.search, $options: 'i' } },
        { uniqueId: { $regex: validatedParams.search, $options: 'i' } },
        { tags: { $in: [new RegExp(validatedParams.search, 'i')] } },
      ];
    }

    const result = await studyOfferService.getOffers(
      filters,
      validatedParams.page,
      validatedParams.limit
    );

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    const errorResponse = errorHandler(error);
    return NextResponse.json(
      { success: false, error: errorResponse.error },
      { status: errorResponse.statusCode }
    );
  }
}

// POST a new study offer
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting and check admin access
    await defaultRateLimit(req);
    await requireAdmin(req);

    // Parse and validate request body
    const data = await req.json();
    const validatedData = createStudyOfferSchema.parse(data);

    // Create new offer
    const newOffer = await studyOfferService.createOffer(validatedData);

    return NextResponse.json(
      { success: true, data: newOffer },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = errorHandler(error);
    return NextResponse.json(
      { success: false, error: errorResponse.error },
      { status: errorResponse.statusCode }
    );
  }
} 