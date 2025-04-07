import { NextRequest, NextResponse } from "next/server";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

// Promisify the scrypt function
const scryptAsync = promisify(scrypt);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
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

    // Create new user with minimal information
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'user',
      status: 'active'
    });

    // Return user data (without password)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
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