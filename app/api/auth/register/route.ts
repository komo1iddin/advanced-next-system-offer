import { NextRequest, NextResponse } from "next/server";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

// Promisify the scrypt function
const scryptAsync = promisify(scrypt);

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

    // Generate a random salt
    const salt = randomBytes(16).toString('hex');
    
    // Hash the password with the salt
    const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
    
    // Store the salt and hashed password together
    const hashedPassword = `${salt}:${derivedKey.toString('hex')}`;

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