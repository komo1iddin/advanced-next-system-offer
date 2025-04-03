import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getServerSession } from "next-auth/next";

export async function POST(req: NextRequest) {
  try {
    // Get the current session to verify it's the same user
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Get user ID from request body
    const { userId } = await req.json();
    
    // Verify that the user in the session is the same as the target user
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: You can only change your own role" },
        { status: 403 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find the user and update role to admin
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: "admin" },
      { new: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "User role updated to admin",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
    
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user role", error: (error as Error).message },
      { status: 500 }
    );
  }
} 