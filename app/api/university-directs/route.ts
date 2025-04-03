import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UniversityDirect from '@/lib/models/UniversityDirect';
import { getServerSession } from 'next-auth/next';

// GET all university directs
export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse query parameters
    const url = new URL(req.url);
    const activeOnly = url.searchParams.get('activeOnly') === 'true';
    
    // Build query
    const query: any = {};
    if (activeOnly) {
      query.active = true;
    }
    
    // Fetch university directs
    const universityDirects = await UniversityDirect.find(query).sort({ universityName: 1 });
    
    return NextResponse.json({
      success: true,
      data: universityDirects
    });
  } catch (error) {
    console.error('Error fetching university directs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch university directs' },
      { status: 500 }
    );
  }
}

// POST a new university direct
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession();
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const data = await req.json();
    
    // Create a new university direct
    const newUniversityDirect = await UniversityDirect.create(data);
    
    return NextResponse.json(
      { success: true, data: newUniversityDirect },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating university direct:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create university direct' },
      { status: 500 }
    );
  }
} 