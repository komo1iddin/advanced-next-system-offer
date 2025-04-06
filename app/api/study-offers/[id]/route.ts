import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import StudyOffer from '@/lib/models/StudyOffer';

interface Params {
  params: {
    id: string;
  }
}

// GET a specific study offer by ID
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the offer by ID
    const offer = await StudyOffer.findById(id);
    
    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Study offer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: offer });
  } catch (error) {
    console.error('Error fetching study offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch study offer' },
      { status: 500 }
    );
  }
}

// PUT (update) a specific study offer by ID
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const data = await req.json();
    
    // Find the current offer to get its uniqueId
    const currentOffer = await StudyOffer.findById(id);
    
    if (!currentOffer) {
      return NextResponse.json(
        { success: false, error: 'Study offer not found' },
        { status: 404 }
      );
    }
    
    // Ensure uniqueId is preserved and cannot be modified
    const updateData = {
      ...data,
      uniqueId: currentOffer.uniqueId, // Preserve the original uniqueId
      updatedAt: new Date()
    };
    
    // Find and update the offer
    const updatedOffer = await StudyOffer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedOffer) {
      return NextResponse.json(
        { success: false, error: 'Study offer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedOffer });
  } catch (error) {
    console.error('Error updating study offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update study offer' },
      { status: 500 }
    );
  }
}

// DELETE a specific study offer by ID
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Connect to the database
    await connectToDatabase();
    
    // Find and delete the offer
    const deletedOffer = await StudyOffer.findByIdAndDelete(id);
    
    if (!deletedOffer) {
      return NextResponse.json(
        { success: false, error: 'Study offer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Study offer deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting study offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete study offer' },
      { status: 500 }
    );
  }
} 