import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import StudyOffer from '@/lib/models/StudyOffer';
import { getServerSession } from 'next-auth/next';
import { generateUniqueId } from '@/lib/generateUniqueId';

// GET all study offers
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const degreeLevel = url.searchParams.get('degreeLevel');
    const searchQuery = url.searchParams.get('search');
    const uniqueId = url.searchParams.get('uniqueId');
    const featured = url.searchParams.get('featured');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const page = parseInt(url.searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Connect to the database
    await connectToDatabase();

    // Build the query
    let query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (degreeLevel) {
      query.degreeLevel = degreeLevel;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    // If uniqueId is provided, search for exact match
    if (uniqueId) {
      query.uniqueId = uniqueId;
    }
    // Otherwise handle general search
    else if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { universityName: { $regex: searchQuery, $options: 'i' } },
        { uniqueId: { $regex: searchQuery, $options: 'i' } }, // Add search by uniqueId
        { tags: { $in: [new RegExp(searchQuery, 'i')] } },
      ];
    }

    // Execute the query
    const offers = await StudyOffer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await StudyOffer.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: offers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching study offers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch study offers' },
      { status: 500 }
    );
  }
}

// POST a new study offer
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
    
    // Generate a unique ID based on the degree level and ensure it's unique
    let uniqueId = generateUniqueId(data.degreeLevel);
    let isUnique = false;
    let maxAttempts = 5;  // Limit the number of attempts to prevent infinite loops
    
    // Check if the generated ID already exists and regenerate if necessary
    while (!isUnique && maxAttempts > 0) {
      const existingOffer = await StudyOffer.findOne({ uniqueId });
      if (!existingOffer) {
        isUnique = true;
      } else {
        uniqueId = generateUniqueId(data.degreeLevel);
        maxAttempts--;
      }
    }
    
    // If we couldn't generate a unique ID after several attempts, return an error
    if (!isUnique) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate a unique ID' },
        { status: 500 }
      );
    }
    
    // Add the unique ID to the data
    const offerData = {
      ...data,
      uniqueId
    };
    
    // Create a new study offer
    const newOffer = await StudyOffer.create(offerData);
    
    return NextResponse.json(
      { success: true, data: newOffer },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating study offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create study offer' },
      { status: 500 }
    );
  }
} 