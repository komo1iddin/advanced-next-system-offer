import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import University from "@/lib/models/University";
import City from "@/lib/models/City";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Connect to the database
    await connectToDatabase();
    
    try {
      // Fetch universities with their location information
      // Properly populate the nested provinceId field
      const universities = await University.find()
        .populate({
          path: 'locationId',
          populate: {
            path: 'provinceId'
          }
        })
        .sort({ name: 1 });
      
      // Format the universities for the frontend
      const formattedUniversities = universities.map(university => ({
        id: university._id.toString(),
        name: university.name,
        localRanking: university.localRanking,
        worldRanking: university.worldRanking,
        location: {
          id: university.locationId?._id.toString() || "",
          city: university.locationId?.name || "Unknown City",
          province: university.locationId?.provinceId?.name || "Unknown Province"
        },
        active: university.active || false,
        createdAt: university.createdAt,
        updatedAt: university.updatedAt
      }));
      
      return NextResponse.json(formattedUniversities);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching universities:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, locationId, localRanking, worldRanking } = body;

    // Connect to the database
    await connectToDatabase();
    
    // Validate the location exists
    const location = await City.findById(locationId).populate('provinceId');
    
    if (!location) {
      return new NextResponse("Location not found", { status: 404 });
    }
    
    // Create a new university
    const university = await University.create({
      name,
      locationId,
      localRanking: localRanking || null,
      worldRanking: worldRanking || null
    });
    
    // Format the response
    const formattedUniversity = {
      id: university._id.toString(),
      name: university.name,
      localRanking: university.localRanking,
      worldRanking: university.worldRanking,
      location: {
        id: location._id.toString(),
        city: location.name,
        province: location.provinceId?.name || "Unknown Province"
      },
      createdAt: university.createdAt,
      updatedAt: university.updatedAt
    };
    
    return NextResponse.json(formattedUniversity);
  } catch (error) {
    console.error("Error creating university:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 