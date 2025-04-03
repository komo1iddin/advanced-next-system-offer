import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Agent from '@/lib/models/Agent';
import { getServerSession } from 'next-auth/next';

// GET all agents
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    
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
    
    // Fetch agents
    const agents = await Agent.find(query).sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      data: agents
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST a new agent
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
    
    // Create a new agent
    const newAgent = await Agent.create(data);
    
    return NextResponse.json(
      { success: true, data: newAgent },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create agent' },
      { status: 500 }
    );
  }
} 