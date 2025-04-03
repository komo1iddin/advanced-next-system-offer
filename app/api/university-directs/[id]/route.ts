import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UniversityDirect from '@/lib/models/UniversityDirect';
import { getServerSession } from 'next-auth/next';

// GET a specific university direct by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database first
    await connectToDatabase();
    
    // Get the ID directly from params
    const id = params.id;
    
    // Find the university direct by ID
    const universityDirect = await UniversityDirect.findById(id);
    
    if (!universityDirect) {
      return NextResponse.json(
        { success: false, error: 'University direct not found' },
        { status: 404 }
      );
    }
    
    // Convert the Mongoose document to a plain JavaScript object
    const universityDirectData = universityDirect.toObject();
    
    return NextResponse.json(universityDirectData);
  } catch (error) {
    console.error('Error fetching university direct:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch university direct' },
      { status: 500 }
    );
  }
}

// PUT (update) a specific university direct by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the ID directly from params
    const id = params.id;
    
    // Connect to the database first (before auth check)
    await connectToDatabase();
    
    // Check if user is authenticated
    const session = await getServerSession();
    
    console.log("Session in PUT /api/university-directs:", JSON.stringify(session, null, 2));
    
    if (!session) {
      console.error("No session found in PUT /api/university-directs");
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (!session.user) {
      console.error("No user in session for PUT /api/university-directs");
      return NextResponse.json(
        { success: false, error: 'User not found in session' },
        { status: 401 }
      );
    }
    
    // If role is missing in session, try to get it from database
    if (!session.user.role) {
      // Import User model only when needed to avoid circular dependencies
      const User = (await import('@/lib/models/User')).default;
      
      // Try to find the user by email
      const userEmail = session.user.email;
      console.log(`Looking up user with email: ${userEmail} to verify admin rights`);
      
      if (!userEmail) {
        console.error("No email in session for PUT /api/university-directs");
        return NextResponse.json(
          { success: false, error: 'User email not found in session' },
          { status: 401 }
        );
      }
      
      const user = await User.findOne({ email: userEmail });
      
      if (!user) {
        console.error(`User with email ${userEmail} not found in database`);
        return NextResponse.json(
          { success: false, error: 'User not found in database' },
          { status: 401 }
        );
      }
      
      console.log(`Found user with role: ${user.role}`);
      
      if (user.role !== 'admin') {
        console.error(`User role (${user.role}) from database is not admin for PUT /api/university-directs`);
        return NextResponse.json(
          { success: false, error: 'Admin privileges required' },
          { status: 403 }
        );
      }
      
      console.log("Verified admin rights through database lookup");
    } else if (session.user.role !== 'admin') {
      console.error(`User role (${session.user.role}) is not admin for PUT /api/university-directs`);
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const data = await req.json();
    console.log("Request data for PUT /api/university-directs:", data);
    
    // Find the university direct first to check if it exists
    const existingUniversityDirect = await UniversityDirect.findById(id);
    
    if (!existingUniversityDirect) {
      return NextResponse.json(
        { success: false, error: 'University direct not found' },
        { status: 404 }
      );
    }
    
    // If we're only updating the active status, preserve all other fields
    if (Object.keys(data).length === 1 && 'active' in data) {
      console.log(`Updating only active status to ${data.active} for university direct ${id}`);
    }
    
    // Find and update the university direct
    const updatedUniversityDirect = await UniversityDirect.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedUniversityDirect) {
      return NextResponse.json(
        { success: false, error: 'Failed to update university direct' },
        { status: 500 }
      );
    }
    
    // Convert the Mongoose document to a plain JavaScript object
    const updatedUniversityDirectData = updatedUniversityDirect.toObject();
    console.log("Successfully updated university direct:", updatedUniversityDirectData._id);
    
    return NextResponse.json(updatedUniversityDirectData);
  } catch (error) {
    console.error('Error updating university direct:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update university direct' },
      { status: 500 }
    );
  }
}

// DELETE a specific university direct by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the ID directly from params
    const id = params.id;
    
    // Connect to the database first (before auth check)
    await connectToDatabase();
    
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession();
    
    console.log("Session in DELETE /api/university-directs:", JSON.stringify(session, null, 2));
    
    if (!session) {
      console.error("No session found in DELETE /api/university-directs");
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (!session.user) {
      console.error("No user in session for DELETE /api/university-directs");
      return NextResponse.json(
        { success: false, error: 'User not found in session' },
        { status: 401 }
      );
    }
    
    // If role is missing in session, try to get it from database
    if (!session.user.role) {
      // Import User model only when needed to avoid circular dependencies
      const User = (await import('@/lib/models/User')).default;
      
      // Try to find the user by email
      const userEmail = session.user.email;
      console.log(`Looking up user with email: ${userEmail} to verify admin rights`);
      
      if (!userEmail) {
        console.error("No email in session for DELETE /api/university-directs");
        return NextResponse.json(
          { success: false, error: 'User email not found in session' },
          { status: 401 }
        );
      }
      
      const user = await User.findOne({ email: userEmail });
      
      if (!user) {
        console.error(`User with email ${userEmail} not found in database`);
        return NextResponse.json(
          { success: false, error: 'User not found in database' },
          { status: 401 }
        );
      }
      
      console.log(`Found user with role: ${user.role}`);
      
      if (user.role !== 'admin') {
        console.error(`User role (${user.role}) from database is not admin for DELETE /api/university-directs`);
        return NextResponse.json(
          { success: false, error: 'Admin privileges required' },
          { status: 403 }
        );
      }
      
      console.log("Verified admin rights through database lookup");
    } else if (session.user.role !== 'admin') {
      console.error(`User role (${session.user.role}) is not admin for DELETE /api/university-directs`);
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Check if the university direct exists
    const existingUniversityDirect = await UniversityDirect.findById(id);
    
    if (!existingUniversityDirect) {
      return NextResponse.json(
        { success: false, error: 'University direct not found' },
        { status: 404 }
      );
    }
    
    console.log(`Attempting to delete university direct with ID: ${id}`);
    
    // Find and delete the university direct
    const deletedUniversityDirect = await UniversityDirect.findByIdAndDelete(id);
    
    if (!deletedUniversityDirect) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete university direct' },
        { status: 500 }
      );
    }
    
    console.log(`Successfully deleted university direct with ID: ${id}`);
    
    return NextResponse.json(
      { success: true, message: 'University direct deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting university direct:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete university direct' },
      { status: 500 }
    );
  }
} 