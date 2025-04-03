import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import City from '@/lib/models/City';
import Province from '@/lib/models/Province';
import { getServerSession } from 'next-auth/next';
import User from '@/lib/models/User';

interface Params {
  params: {
    id: string;
  }
}

// GET a specific city by ID
export async function GET(req: NextRequest, { params }: Params) {
  try {
    // Get the ID from params
    const id = params.id;
    
    // Parse query parameters
    const url = new URL(req.url);
    const includeProvince = url.searchParams.get('includeProvince') === 'true';
    
    // Connect to the database
    await connectToDatabase();
    
    // Fetch the city
    let cityQuery = City.findById(id);
    
    // Populate province data if requested
    if (includeProvince) {
      cityQuery = cityQuery.populate('provinceId');
    }
    
    const city = await cityQuery;
    
    if (!city) {
      return NextResponse.json(
        { success: false, message: 'City not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: city
    });
  } catch (error) {
    console.error('Error fetching city:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch city' },
      { status: 500 }
    );
  }
}

// UPDATE a city by ID (requires admin rights)
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    // Get the ID from params
    const id = params.id;
    
    // Get the session
    const session = await getServerSession();
    console.log('Session in PUT /api/cities:', JSON.stringify(session, null, 2));
    
    // Check if user is authenticated
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
    console.log('Request data for PUT /api/cities:', data);
    
    // Check if only updating active status
    if (Object.keys(data).length === 1 && 'active' in data) {
      console.log(`Updating only active status to ${data.active} for city ${id}`);
      const updatedCity = await City.findByIdAndUpdate(
        id,
        { active: data.active },
        { new: true, runValidators: true }
      );
      
      if (!updatedCity) {
        return NextResponse.json(
          { success: false, message: 'City not found' },
          { status: 404 }
        );
      }
      
      console.log(`Successfully updated city: ${updatedCity._id}`);
      return NextResponse.json({ success: true, data: updatedCity });
    }
    
    // For full updates, validate required fields
    if (!data.name || !data.provinceId) {
      return NextResponse.json(
        { success: false, message: 'Name and provinceId are required' },
        { status: 400 }
      );
    }
    
    // Validate that province exists
    if (data.provinceId) {
      const provinceExists = await Province.findById(data.provinceId);
      if (!provinceExists) {
        return NextResponse.json(
          { success: false, message: 'Province not found' },
          { status: 400 }
        );
      }
    }
    
    // Update the city
    const updatedCity = await City.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!updatedCity) {
      return NextResponse.json(
        { success: false, message: 'City not found' },
        { status: 404 }
      );
    }
    
    // Populate province data for response
    await updatedCity.populate('provinceId');
    
    return NextResponse.json({
      success: true,
      data: updatedCity
    });
  } catch (error: any) {
    console.error('Error updating city:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'City with this name already exists in the selected province' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to update city', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE a city by ID (requires admin rights)
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    // Get the ID from params
    const id = params.id;
    
    // Get the session
    const session = await getServerSession();
    
    // Check if user is authenticated
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
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin rights required' },
        { status: 403 }
      );
    }
    
    // Delete the city
    const deletedCity = await City.findByIdAndDelete(id);
    
    if (!deletedCity) {
      return NextResponse.json(
        { success: false, message: 'City not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'City deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting city:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete city', error: (error as Error).message },
      { status: 500 }
    );
  }
} 