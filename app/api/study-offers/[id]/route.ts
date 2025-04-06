import { NextRequest, NextResponse } from 'next/server';
import { StudyOfferService } from '@/lib/services/StudyOfferService';
import { errorHandler } from '@/lib/utils/error';
import { updateStudyOfferSchema } from '@/lib/validators/studyOffer.validator';
import { requireAdmin } from '@/lib/middleware/auth';
import { defaultRateLimit } from '@/lib/middleware/rateLimit';

const studyOfferService = new StudyOfferService();

// GET a single study offer
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    await defaultRateLimit(req);

    const offer = await studyOfferService.getOfferById(params.id);
    return NextResponse.json({ success: true, data: offer });
  } catch (error) {
    const errorResponse = errorHandler(error);
    return NextResponse.json(
      { success: false, error: errorResponse.error },
      { status: errorResponse.statusCode }
    );
  }
}

// UPDATE a study offer
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting and check admin access
    await defaultRateLimit(req);
    await requireAdmin(req);

    // Parse and validate request body
    const data = await req.json();
    const validatedData = updateStudyOfferSchema.parse(data);

    // Update offer
    const updatedOffer = await studyOfferService.updateOffer(params.id, validatedData);

    return NextResponse.json({ success: true, data: updatedOffer });
  } catch (error) {
    const errorResponse = errorHandler(error);
    return NextResponse.json(
      { success: false, error: errorResponse.error },
      { status: errorResponse.statusCode }
    );
  }
}

// DELETE a study offer
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting and check admin access
    await defaultRateLimit(req);
    await requireAdmin(req);

    // Delete offer
    await studyOfferService.deleteOffer(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorResponse = errorHandler(error);
    return NextResponse.json(
      { success: false, error: errorResponse.error },
      { status: errorResponse.statusCode }
    );
  }
} 