import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Agent from '@/lib/models/Agent';
import { getServerSession } from 'next-auth/next';

// GET a specific agent by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database first
    await connectToDatabase();
    
    // Get the ID directly from params
    const id = params.id;
    
    // Find the agent by ID
    const agent = await Agent.findById(id);
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Convert the Mongoose document to a plain JavaScript object
    const agentData = agent.toObject();
    
    return NextResponse.json(agentData);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

// PUT (update) a specific agent by ID
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
    
    console.log("Session in PUT /api/agents:", JSON.stringify(session, null, 2));
    
    if (!session) {
      console.error("No session found in PUT /api/agents");
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (!session.user) {
      console.error("No user in session for PUT /api/agents");
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
        console.error("No email in session for PUT /api/agents");
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
        console.error(`User role (${user.role}) from database is not admin for PUT /api/agents`);
        return NextResponse.json(
          { success: false, error: 'Admin privileges required' },
          { status: 403 }
        );
      }
      
      console.log("Verified admin rights through database lookup");
    } else if (session.user.role !== 'admin') {
      console.error(`User role (${session.user.role}) is not admin for PUT /api/agents`);
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const data = await req.json();
    console.log("Request data for PUT /api/agents:", data);
    
    // Find the agent first to check if it exists
    const existingAgent = await Agent.findById(id);
    
    if (!existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // If we're only updating the active status, preserve all other fields
    if (Object.keys(data).length === 1 && 'active' in data) {
      console.log(`Updating only active status to ${data.active} for agent ${id}`);
    }
    
    // Find and update the agent
    const updatedAgent = await Agent.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedAgent) {
      return NextResponse.json(
        { success: false, error: 'Failed to update agent' },
        { status: 500 }
      );
    }
    
    // Convert the Mongoose document to a plain JavaScript object
    const updatedAgentData = updatedAgent.toObject();
    console.log("Successfully updated agent:", updatedAgentData._id);
    
    return NextResponse.json(updatedAgentData);
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

// DELETE a specific agent by ID
export async function DELETE(
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
    
    console.log("Session in DELETE /api/agents:", JSON.stringify(session, null, 2));
    
    if (!session) {
      console.error("No session found in DELETE /api/agents");
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (!session.user) {
      console.error("No user in session for DELETE /api/agents");
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
        console.error("No email in session for DELETE /api/agents");
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
        console.error(`User role (${user.role}) from database is not admin for DELETE /api/agents`);
        return NextResponse.json(
          { success: false, error: 'Admin privileges required' },
          { status: 403 }
        );
      }
      
      console.log("Verified admin rights through database lookup");
    } else if (session.user.role !== 'admin') {
      console.error(`User role (${session.user.role}) is not admin for DELETE /api/agents`);
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Check if the agent exists
    const existingAgent = await Agent.findById(id);
    
    if (!existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    console.log(`Attempting to delete agent with ID: ${id}`);
    
    // Find and delete the agent
    const deletedAgent = await Agent.findByIdAndDelete(id);
    
    if (!deletedAgent) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete agent' },
        { status: 500 }
      );
    }
    
    console.log(`Successfully deleted agent with ID: ${id}`);
    
    return NextResponse.json(
      { success: true, message: 'Agent deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
} 