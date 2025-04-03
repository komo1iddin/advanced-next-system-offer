import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await getServerSession();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({
        success: false,
        message: "You are not logged in",
      }, { status: 401 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get latest user from database
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found in database",
      }, { status: 404 });
    }
    
    // Note: We can't directly manipulate the token here, we can only provide info
    // The client will need to sign out and sign back in
    
    return NextResponse.json({
      success: true,
      currentSession: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
      databaseUser: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      mismatch: session.user.role !== user.role,
      instructions: "To refresh your token, you need to sign out and sign back in. We recommend clearing your browser cookies for this site before signing in again."
    });
    
  } catch (error: any) {
    console.error("Error in force-refresh-token:", error);
    return NextResponse.json({
      success: false,
      message: `Error: ${error.message}`,
    }, { status: 500 });
  }
} 