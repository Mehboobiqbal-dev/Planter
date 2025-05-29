// File: app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb-client"; // Ensure this path is correct
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

// Ensure JWT_SECRET is defined
const JWT_SECRET = process.env.JWT_SECRET;

// Define user document type for this route
interface UserDocumentForRegister {
  _id: ObjectId;
  email: string;
  name: string;
  password: string; // Hashed password
  fullName: string;
  username: string;
  avatar: string;
  plantCareReminders: boolean;
  newArticlesNotifications: boolean;
  provider?: string; // Optional: to mark as 'credentials'
  // Add any other fields NextAuth adapter might expect or your app uses
  emailVerified?: Date | null; // Often added by NextAuth adapter
  image?: string; // Often added by NextAuth adapter (can be same as avatar)
}


export async function POST(req: NextRequest) {
  try {
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables.");
      return NextResponse.json(
        { error: "Server configuration error: JWT_SECRET is missing." },
        { status: 500 }
      );
    }

    const client = await clientPromise;
    const db = client.db(); // Specify your database name if not in clientPromise
    const usersCollection = db.collection("users"); // Ensure this matches NextAuth adapter's collection

    const { email, password, name, confirmPassword } = await req.json();

    // Basic input validation
    if (!email || !password || !name || !confirmPassword) {
      return NextResponse.json(
        { error: "Email, password, name, and confirm password are required" },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 } // 409 Conflict
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: UserDocumentForRegister = {
      _id: new ObjectId(),
      email,
      name,
      password: hashedPassword,
      fullName: name, // Default fullName to name
      username: email.split("@")[0], // Default username from email
      avatar: "", // Default empty avatar string
      plantCareReminders: false,
      newArticlesNotifications: false,
      provider: 'credentials', // Explicitly set provider
      emailVerified: null, // Default for NextAuth adapter compatibility
      // image: "", // if you use 'image' field for NextAuth
    };

    const result = await usersCollection.insertOne(newUser);

    if (!result.insertedId) {
      console.error("Failed to insert user into database.");
      return NextResponse.json(
        { error: "Failed to register user" },
        { status: 500 }
      );
    }

    // Generate JWT token (optional if NextAuth handles session immediately after)
    const token = jwt.sign(
      { userId: result.insertedId.toString(), email: newUser.email, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "1h" } // Or a shorter duration like "15m"
    );

    // Prepare user data to return, omitting password
    const { password: _, ...userToReturn } = newUser;

    console.log("User registered successfully via /api/register:", newUser.email);
    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully.", // Added a message
        user: { // Return the user object without the hashed password
          id: result.insertedId.toString(),
          email: userToReturn.email,
          name: userToReturn.name,
          username: userToReturn.username,
          fullName: userToReturn.fullName,
          avatar: userToReturn.avatar,
          plantCareReminders: userToReturn.plantCareReminders,
          newArticlesNotifications: userToReturn.newArticlesNotifications,
        },
        token, // This token can be used by the client if needed, but NextAuth will issue its own session cookie
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("Error in POST /api/register:", {
      message: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : undefined,
    });
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    // Avoid exposing too much detail in production for 500 errors
    return NextResponse.json(
      { error: "Server error during registration.", details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    );
  }
}