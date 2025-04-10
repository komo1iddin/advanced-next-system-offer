import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import { ErrorHandler } from "@/lib/middleware/errorHandler";
import mongoose from "mongoose";
import { cacheService } from "@/lib/services/CacheService";

// Timeout Promise helper
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Database operation timed out'));
    }, timeoutMs);
  });
  
  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
};

const CACHE_PREFIX = 'user_profile:';
const QUERY_TIMEOUT = 5000; // 5 seconds
const CACHE_TTL = 300; // 5 minutes

// GET user profile
export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Try to get from cache first
    const cacheKey = `${CACHE_PREFIX}${session.user.email}`;
    const cachedData = await cacheService.get(cacheKey);
    
    if (cachedData) {
      return NextResponse.json({ user: cachedData });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find the user with timeout
    const user = await withTimeout(
      User.findOne({ email: session.user.email }).select('-password').lean().exec(),
      QUERY_TIMEOUT
    );
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Cache the user data
    await cacheService.set(cacheKey, user, CACHE_TTL);
    
    // Return user data
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    if (error instanceof Error && error.message === 'Database operation timed out') {
      return NextResponse.json(
        { error: "Database operation timed out. Please try again later." }, 
        { status: 504 }
      );
    }
    
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
    
    // Find the user with timeout
    const user = await withTimeout(
      User.findOne({ email: session.user.email }),
      QUERY_TIMEOUT
    );
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Update user model with validation
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    
    // Save the changes with timeout
    await withTimeout(user.save(), QUERY_TIMEOUT);
    
    // Clear the user cache
    await cacheService.del(`${CACHE_PREFIX}${session.user.email}`);
    
    // Return success
    return NextResponse.json({ 
      message: "Profile updated successfully",
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error instanceof Error && error.message === 'Database operation timed out') {
      return NextResponse.json(
        { error: "Database operation timed out. Please try again later." }, 
        { status: 504 }
      );
    }
    
    return ErrorHandler.handle(error);
  }
} 