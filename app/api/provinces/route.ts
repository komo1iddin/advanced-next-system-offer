import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Province from '@/lib/models/Province';
import { getServerSession } from 'next-auth/next';
import User from '@/lib/models/User';

// GET all provinces
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const activeOnly = url.searchParams.get('activeOnly') === 'true';
    const country = url.searchParams.get('country');
    
    // Connect to the database
    await connectToDatabase();
    
    // Build query
    const query: any = {};
    if (activeOnly) {
      query.active = true;
    }
    if (country) {
      query.country = country;
    }
    
    // Fetch provinces
    const provinces = await Province.find(query).sort({ country: 1, name: 1 });
    
    return NextResponse.json({
      success: true,
      data: provinces
    });
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch provinces' },
      { status: 500 }
    );
  }
}

// POST a new province (requires admin rights)
export async function POST(req: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession();
    console.log('Session in POST /api/provinces:', JSON.stringify(session, null, 2));
    
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
    console.log('Request data for POST /api/provinces:', data);
    
    // Validate request data
    if (!data.name || !data.country) {
      return NextResponse.json(
        { success: false, message: 'Name and country are required' },
        { status: 400 }
      );
    }
    
    // Create new province
    const newProvince = await Province.create(data);
    
    return NextResponse.json(
      { success: true, data: newProvince },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating province:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Province with this name already exists in the selected country' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to create province', error: (error as Error).message },
      { status: 500 }
    );
  }
} 