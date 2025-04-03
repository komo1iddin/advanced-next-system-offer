import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Tag from '@/lib/models/Tag';
import { getServerSession } from 'next-auth/next';

// GET a specific tag by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/tags/${params.id} - Request received`);
    
    // Connect to the database
    await connectToDatabase();
    
    // Get the ID from params
    const id = params.id;
    
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
    console.log(`PUT /api/tags/${params.id} - Request received`);
    
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession();
    console.log(`PUT /api/tags/${params.id} - Session:`, session?.user);
    
    if (!session || !session.user) {
      console.log(`PUT /api/tags/${params.id} - No session or user`);
      return NextResponse.json(
        { error: 'Unauthorized - Not authenticated' },
        { status: 401 }
      );
    }
    
    // Debug user role
    console.log(`PUT /api/tags/${params.id} - User role:`, session.user.role);
    
    if (session.user.role !== 'admin') {
      console.log(`PUT /api/tags/${params.id} - Not admin role:`, session.user.role);
      return NextResponse.json(
        { error: 'Unauthorized - Admin role required' },
        { status: 403 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get the ID from params
    const id = params.id;
    
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
    console.log(`DELETE /api/tags/${params.id} - Request received`);
    
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession();
    console.log(`DELETE /api/tags/${params.id} - Session:`, session?.user);
    
    if (!session || !session.user) {
      console.log(`DELETE /api/tags/${params.id} - No session or user`);
      return NextResponse.json(
        { error: 'Unauthorized - Not authenticated' },
        { status: 401 }
      );
    }
    
    // Debug user role
    console.log(`DELETE /api/tags/${params.id} - User role:`, session.user.role);
    
    if (session.user.role !== 'admin') {
      console.log(`DELETE /api/tags/${params.id} - Not admin role:`, session.user.role);
      return NextResponse.json(
        { error: 'Unauthorized - Admin role required' },
        { status: 403 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get the ID from params
    const id = params.id;
    
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