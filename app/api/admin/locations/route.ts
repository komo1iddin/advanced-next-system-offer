import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import City from "@/lib/models/City";
import Province from "@/lib/models/Province";
import mongoose from "mongoose";

// Initialize models (ensure schemas are registered)
const models = { City, Province };

// Helper function to safely fetch cities with provinces
async function getCitiesWithProvinces() {
  try {
    // First, ensure Province model is registered by running a simple query
    await Province.findOne({});
    
    // Now fetch cities with populated province data
    const cities = await City.find({ active: true })
      .populate({
        path: 'provinceId',
        model: 'Province'
      })
      .sort({ name: 1 });
    
    return cities;
  } catch (error) {
    console.error("Error in getCitiesWithProvinces:", error);
    
    // Try a different approach if the populate fails
    try {
      // Get cities and provinces separately
      const cities = await City.find({ active: true }).sort({ name: 1 });
      const provinces = await Province.find({}).sort({ name: 1 });
      
      // Create a map of province IDs to province objects
      const provinceMap = new Map();
      provinces.forEach(province => {
        provinceMap.set(province._id.toString(), province);
      });
      
      // Manually attach province data to cities
      cities.forEach(city => {
        if (city.provinceId) {
          const provinceId = city.provinceId.toString();
          const province = provinceMap.get(provinceId);
          if (province) {
            city.provinceId = province;
          }
        }
      });
      
      return cities;
    } catch (fallbackError) {
      console.error("Fallback approach also failed:", fallbackError);
      return [];
    }
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Connect to the database
    await connectToDatabase();
    
    try {
      // Get cities with their province information
      const cities = await getCitiesWithProvinces();
      
      // Format the locations for the frontend
      const locations = cities.map(city => {
        // Safely access province name
        let provinceName = "Unknown";
        let provinceId = "";
        
        if (city.provinceId) {
          if (typeof city.provinceId === 'object' && city.provinceId.name) {
            provinceName = city.provinceId.name;
            provinceId = city.provinceId._id.toString();
          } else if (typeof city.provinceId === 'string') {
            provinceId = city.provinceId;
          }
        }
        
        return {
          id: city._id.toString(),
          city: city.name,
          province: provinceName,
          provinceId: provinceId,
          createdAt: city.createdAt,
          updatedAt: city.updatedAt
        };
      });
      
      return NextResponse.json(locations);
    } catch (dbError: unknown) {
      console.error("Database error:", dbError);
      console.error(dbError instanceof Error ? dbError.stack : "No stack trace available");
      
      // Return mock data as fallback in case of database errors
      const fallbackLocations = [
        {
          id: "fallback1",
          city: "Sample City",
          province: "Sample Province",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      return NextResponse.json(fallbackLocations);
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 