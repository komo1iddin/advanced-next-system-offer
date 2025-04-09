import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Tag from '@/lib/models/Tag';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth/next';

// GET a specific tag by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`GET /api/tags/${id} - Request received`);
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the tag by ID
    const tag = await Tag.findById(id);
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(tag);
  } catch (error: any) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { error: `Failed to fetch tag: ${error.message}` },
      { status: 500 }
    );
  }
}

// UPDATE a specific tag by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`PUT /api/tags/${id} - Request received`);
    
    // Check if user is authenticated
    const session = await getServerSession();
    console.log(`PUT /api/tags/${id} - Session:`, JSON.stringify(session, null, 2));
    
    // Verify session exists and has user email
    if (!session?.user?.email) {
      console.log(`PUT /api/tags/${id} - No session or user email`);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Verify admin rights through database lookup instead of relying on session
    const user = await User.findOne({ email: session.user.email });
    console.log(`Looking up user with email: ${session.user.email} to verify admin rights`);
    
    if (!user || user.role !== 'admin') {
      console.log(`User not found or not admin. User: ${user?._id}, Role: ${user?.role}`);
      return NextResponse.json(
        { error: 'Admin rights required' },
        { status: 403 }
      );
    }
    
    console.log('Verified admin rights through database lookup');
    
    // Parse the request body
    const data = await req.json();
    console.log(`Tag update data:`, data);
    
    // Check if another tag with the same name exists (excluding this one)
    if (data.name) {
      const existingTag = await Tag.findOne({ 
        name: data.name,
        _id: { $ne: id }
      });
      
      if (existingTag) {
        return NextResponse.json(
          { error: 'Another tag with this name already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update the tag
    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedTag);
  } catch (error: any) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: `Failed to update tag: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE a specific tag by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`DELETE /api/tags/${id} - Request received`);
    
    // Check if user is authenticated
    const session = await getServerSession();
    console.log(`DELETE /api/tags/${id} - Session:`, JSON.stringify(session, null, 2));
    
    // Verify session exists and has user email
    if (!session?.user?.email) {
      console.log(`DELETE /api/tags/${id} - No session or user email`);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Verify admin rights through database lookup instead of relying on session
    const user = await User.findOne({ email: session.user.email });
    console.log(`Looking up user with email: ${session.user.email} to verify admin rights`);
    
    if (!user || user.role !== 'admin') {
      console.log(`User not found or not admin. User: ${user?._id}, Role: ${user?.role}`);
      return NextResponse.json(
        { error: 'Admin rights required' },
        { status: 403 }
      );
    }
    
    console.log('Verified admin rights through database lookup');
    
    // Delete the tag
    const deletedTag = await Tag.findByIdAndDelete(id);
    
    if (!deletedTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Tag deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: `Failed to delete tag: ${error.message}` },
      { status: 500 }
    );
  }
} 