import Tag from "@/lib/models/Tag";
import User from "@/lib/models/User";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

// GET /api/tags - Get all tags with optional filtering
export async function GET(request: NextRequest) {
  console.log("GET /api/tags - Request received");
  
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    console.log("Query params:", { activeOnly, category, search });

    // Connect to database
    await connectToDatabase();
    console.log("Database connected");

    // Build query
    const query: any = {};
    if (activeOnly) {
      query.active = true;
    }
    if (category) {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    console.log("Running query:", JSON.stringify(query));
    // Fetch tags
    const tags = await Tag.find(query).sort({ category: 1, name: 1 });
    console.log(`Found ${tags.length} tags`);

    return NextResponse.json(tags);
  } catch (error: any) {
    console.error("Error in GET /api/tags:", error);
    return NextResponse.json(
      { error: `Failed to fetch tags: ${error.message}` },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create a new tag (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    console.log("POST /api/tags - Session:", JSON.stringify(session, null, 2));
    
    // Verify session exists and has user email
    if (!session?.user?.email) {
      console.log("POST /api/tags - No session or user email");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Verify admin rights through database lookup instead of relying on session
    const user = await User.findOne({ email: session.user.email });
    console.log(`Looking up user with email: ${session.user.email} to verify admin rights`);
    
    if (!user || user.role !== 'admin') {
      console.log(`User not found or not admin. User: ${user?._id}, Role: ${user?.role}`);
      return NextResponse.json(
        { error: "Admin rights required" },
        { status: 403 }
      );
    }
    
    console.log('Verified admin rights through database lookup');

    // Parse request body
    const body = await request.json();
    const { name, category, active = true } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    // Check if tag already exists
    const existingTag = await Tag.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, "i") },
      category 
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "Tag already exists" },
        { status: 409 }
      );
    }

    // Create new tag
    const newTag = await Tag.create({
      name,
      category,
      active,
    });

    return NextResponse.json(newTag);
  } catch (error: any) {
    console.error("Error in POST /api/tags:", error);
    return NextResponse.json(
      { error: `Failed to create tag: ${error.message}` },
      { status: 500 }
    );
  }
} 