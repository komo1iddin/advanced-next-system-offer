import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import City from '@/lib/models/City';
import Province from '@/lib/models/Province';
import { getServerSession } from 'next-auth/next';
import User from '@/lib/models/User';

// GET all cities
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const activeOnly = url.searchParams.get('activeOnly') === 'true';
    const provinceId = url.searchParams.get('provinceId');
    const includeProviGnce = url.searchParams.get('includeProvince') === 'true';
    
    // Connect to the database
    await connectToDatabase();
    
    // Build query
    const query: any = {};
    if (activeOnly) {
      query.active = true;
    }
    if (provinceId) {
      query.provinceId = provinceId;
    }
    
    // Fetch cities
    let citiesQuery = City.find(query).sort({ name: 1 });
    
    // Populate province data if requested
    if (includeProviGnce) {
      citiesQuery = citiesQuery.populate('provinceId');
    }
    
    const cities = await citiesQuery;
    
    return NextResponse.json({
      success: true,
      data: cities
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

// POST a new city (requires admin rights)
export async function POST(req: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession();
    console.log('Session in POST /api/cities:', JSON.stringify(session, null, 2));
    
    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Verify user has admin rights through database lookup
    const user = await User.findOne({ email: session.user.email });
    console.log(`Looking up user with email: ${session.user.email} to verify admin rights`);
    
    if (!user || user.role !== 'admin') {
      console.log(`User not found or not admin. User role: ${user?.role}`);
      return NextResponse.json(
        { success: false, message: 'Admin rights required' },
        { status: 403 }
      );
    }
    
    console.log('Verified admin rights through database lookup');
    
    // Parse request body
    const data = await req.json();
    console.log('Request data for POST /api/cities:', data);
    
    // Validate request data
    if (!data.name || !data.provinceId) {
      return NextResponse.json(
        { success: false, message: 'Name and provinceId are required' },
        { status: 400 }
      );
    }
    
    // Validate that province exists
    const provinceExists = await Province.findById(data.provinceId);
    if (!provinceExists) {
      return NextResponse.json(
        { success: false, message: 'Province not found' },
        { status: 400 }
      );
    }
    
    // Create new city
    const newCity = await City.create(data);
    
    // Populate province data for response
    await newCity.populate('provinceId');
    
    return NextResponse.json(
      { success: true, data: newCity },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating city:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'City with this name already exists in the selected province' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to create city', error: (error as Error).message },
      { status: 500 }
    );
  }
} 