import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    // Get session to check for authentication
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    const userId = session.user.id;
    
    // Get database connection
    const db = mongoose.connection;
    
    // First, check if sessions collection exists
    const collections = await db.db.listCollections().toArray();
    const sessionsCollection = collections.find(c => c.name === "sessions");
    
    if (!sessionsCollection) {
      return NextResponse.json(
        { success: false, message: "Sessions collection not found" },
        { status: 404 }
      );
    }
    
    // Check if accounts collection exists
    const accountsCollection = collections.find(c => c.name === "accounts");
    
    // Try to force update the JWT if using JWT strategy
    // Get session token from cookies
    const cookies = req.headers.get("cookie");
    let sessionToken = "";
    
    if (cookies) {
      const cookieArray = cookies.split(";");
      for (const cookie of cookieArray) {
        const [name, value] = cookie.trim().split("=");
        if (name === "next-auth.session-token") {
          sessionToken = value;
          break;
        }
      }
    }
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "Session token not found in cookies" },
        { status: 400 }
      );
    }

    // Return information about what we found
    return NextResponse.json({
      success: true,
      message: "Token information retrieved",
      data: {
        userId: userId,
        hasSessionsCollection: !!sessionsCollection,
        hasAccountsCollection: !!accountsCollection,
        sessionTokenFound: !!sessionToken
      }
    });
    
  } catch (error) {
    console.error("Error fixing token:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fix token", error: (error as Error).message },
      { status: 500 }
    );
  }
} 