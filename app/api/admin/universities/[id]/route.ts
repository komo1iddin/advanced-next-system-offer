import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import University from "@/lib/models/University";
import City from "@/lib/models/City";

// Helper function to get session and validate admin access
async function validateAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return false;
  }
  return session;
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  const { id } = await context.params; // Await the params object

  try {
    // Validate admin access
    const session = await validateAdminAccess();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { name, locationId, localRanking, worldRanking } = body;
    
    // Check if the university exists
    const existingUniversity = await University.findById(id); // Use the extracted id
    
    if (!existingUniversity) {
      return new NextResponse("University not found", { status: 404 });
    }
    
    // Validate that the location exists
    const location = await City.findById(locationId).populate('provinceId');
    
    if (!location) {
      return new NextResponse("Location not found", { status: 404 });
    }
    
    // Update the university
    const updatedUniversity = await University.findByIdAndUpdate(
      id, // Use the extracted id
      {
        name,
        locationId,
        localRanking: localRanking || null,
        worldRanking: worldRanking || null
      },
      { new: true }
    ).populate('locationId');
    
    // Format the response
    const formattedUniversity = {
      id: updatedUniversity._id.toString(),
      name: updatedUniversity.name,
      localRanking: updatedUniversity.localRanking,
      worldRanking: updatedUniversity.worldRanking,
      location: {
        id: location._id.toString(),
        city: location.name,
        province: location.provinceId?.name || "Unknown Province"
      },
      createdAt: updatedUniversity.createdAt,
      updatedAt: updatedUniversity.updatedAt
    };
    
    return NextResponse.json(formattedUniversity);
  } catch (error) {
    console.error("Error updating university:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { id } = await context.params; // Await the params object

  try {
    // Validate admin access
    const session = await validateAdminAccess();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Connect to the database
    await connectToDatabase();
    
    // Delete the university from the database
    const result = await University.findByIdAndDelete(id); // Use the extracted id
    
    if (!result) {
      return new NextResponse("University not found", { status: 404 });
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting university:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 