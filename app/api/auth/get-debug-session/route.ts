import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await getServerSession();
    
    // Connect to database
    await connectToDatabase();
    
    let dbUser = null;
    let mismatch = false;
    
    // If user is logged in, get user from database
    if (session && session.user && session.user.id) {
      dbUser = await User.findById(session.user.id);
      
      if (dbUser) {
        mismatch = session.user.role !== dbUser.role;
      }
    }
    
    // Return detailed session debug info
    return NextResponse.json({
      session: {
        exists: !!session,
        user: session?.user || null,
      },
      database: {
        userFound: !!dbUser,
        user: dbUser ? {
          id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
        } : null,
      },
      mismatch,
      nextSteps: mismatch 
        ? "Your session role doesn't match the database. Sign out and sign in again." 
        : "Your session appears to be correct. If you're having issues, check that your role is 'admin' (all lowercase)."
    });
    
  } catch (error: any) {
    console.error("Error in GET /api/auth/get-debug-session:", error);
    return NextResponse.json({
      error: `Error getting debug session info: ${error.message}`,
      session: null,
      database: null,
      mismatch: null,
    }, { status: 500 });
  }
} 