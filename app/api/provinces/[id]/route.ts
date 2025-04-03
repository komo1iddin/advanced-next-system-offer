import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Province from '@/lib/models/Province';
import City from '@/lib/models/City';
import { getServerSession } from 'next-auth/next';
import User from '@/lib/models/User';

interface Params {
  params: {
    id: string;
  }
}

// GET a specific province by ID
export async function GET(req: NextRequest, { params }: Params) {
  try {
    // Get the ID from params
    const id = params.id;
    
    // Connect to the database
    await connectToDatabase();
    
    // Fetch the province
    const province = await Province.findById(id);
    
    if (!province) {
      return NextResponse.json(
        { success: false, message: 'Province not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: province
    });
  } catch (error) {
    console.error('Error fetching province:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch province' },
      { status: 500 }
    );
  }
}

// UPDATE a province by ID (requires admin rights)
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    // Get the ID from params
    const id = params.id;
    
    // Get the session
    const session = await getServerSession();
    console.log('Session in PUT /api/provinces:', JSON.stringify(session, null, 2));
    
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
    console.log('Request data for PUT /api/provinces:', data);
    
    // Check if only updating active status
    if (Object.keys(data).length === 1 && 'active' in data) {
      console.log(`Updating only active status to ${data.active} for province ${id}`);
      const updatedProvince = await Province.findByIdAndUpdate(
        id,
        { active: data.active },
        { new: true, runValidators: true }
      );
      
      if (!updatedProvince) {
        return NextResponse.json(
          { success: false, message: 'Province not found' },
          { status: 404 }
        );
      }
      
      console.log(`Successfully updated province: ${updatedProvince._id}`);
      return NextResponse.json({ success: true, data: updatedProvince });
    }
    
    // For full updates, validate required fields
    if (!data.name || !data.country) {
      return NextResponse.json(
        { success: false, message: 'Name and country are required' },
        { status: 400 }
      );
    }
    
    // Update the province
    const updatedProvince = await Province.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!updatedProvince) {
      return NextResponse.json(
        { success: false, message: 'Province not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedProvince
    });
  } catch (error: any) {
    console.error('Error updating province:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Province with this name already exists in the selected country' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to update province', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE a province by ID (requires admin rights)
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
    
    // Check if province has associated cities
    const citiesCount = await City.countDocuments({ provinceId: id });
    
    if (citiesCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot delete province with associated cities. Please delete ${citiesCount} cities first.` 
        },
        { status: 400 }
      );
    }
    
    // Delete the province
    const deletedProvince = await Province.findByIdAndDelete(id);
    
    if (!deletedProvince) {
      return NextResponse.json(
        { success: false, message: 'Province not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Province deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting province:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete province', error: (error as Error).message },
      { status: 500 }
    );
  }
} 