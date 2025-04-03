import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    // Get current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get user from database to check current role
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found in database" },
        { status: 404 }
      );
    }
    
    // Return diagnostic information
    return NextResponse.json({
      success: true,
      message: "Role mismatch detected",
      sessionInfo: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      },
      databaseInfo: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      },
      mismatch: session.user.role !== user.role,
      next: "Please visit http://localhost:3000/fix-role which will provide a direct fix for this issue"
    });
    
  } catch (error) {
    console.error("Error checking role:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process request", error: (error as Error).message },
      { status: 500 }
    );
  }
} 