import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role = "viewer" } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Return user data (without password)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register user", error: (error as Error).message },
      { status: 500 }
    );
  }
} 