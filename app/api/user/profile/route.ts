import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import { ErrorHandler } from "@/lib/middleware/errorHandler";
import mongoose from "mongoose";

// GET user profile
export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find the user
    const user = await User.findOne({ email: session.user.email }).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Return user data
    return NextResponse.json({ user });
  } catch (error) {
    return ErrorHandler.handle(error);
  }
}

// UPDATE user profile
export async function PUT(request: NextRequest) {
  try {
    // Get current session
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse request body
    const { firstName, lastName, phone } = await request.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Find the user
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Update only the fields that are provided
    if (mongoose.connection.db) {
      // Use direct MongoDB update to bypass Mongoose validation
      const result = await mongoose.connection.db.collection('users').updateOne(
        { _id: user._id },
        { 
          $set: { 
            ...(firstName !== undefined && { firstName }),
            ...(lastName !== undefined && { lastName }),
            ...(phone !== undefined && { phone }),
            updatedAt: new Date()
          } 
        }
      );
      
      if (result.modifiedCount === 0) {
        return NextResponse.json({ message: "No changes were made" }, { status: 200 });
      }
    } else {
      throw new Error('Database connection not established');
    }
    
    // Return success
    return NextResponse.json({ 
      message: "Profile updated successfully",
      user: {
        email: user.email,
        firstName,
        lastName,
        phone
      }
    });
  } catch (error) {
    return ErrorHandler.handle(error);
  }
} 