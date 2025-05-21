import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb-client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

// Ensure JWT_SECRET is defined
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Validate JWT_SECRET
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection("users");

    const { email, password, name, confirmPassword } = await req.json();

    // Validate inputs
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

    // Define user document type
    interface UserDocument {
      _id: ObjectId;
      email: string;
      name: string;
      password: string;
      fullName: string;
      username: string;
      avatar: string;
      plantCareReminders: boolean;
      newArticlesNotifications: boolean;
      [key: string]: any;
    }

    const existingUser = await users.findOne<UserDocument>({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: UserDocument = {
      _id: new ObjectId(),
      email,
      name,
      password: hashedPassword,
      fullName: name,
      username: email.split("@")[0],
      avatar: "",
      plantCareReminders: false,
      newArticlesNotifications: false,
    };

    const result = await users.insertOne(newUser);
    if (!result.insertedId) {
      throw new Error("Failed to register user");
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertedId.toString(), email, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Prepare user data without sensitive fields
    const { password: _, ...userWithoutPassword } = newUser;

    console.log("User registered successfully:", email);
    return NextResponse.json(
      {
        success: true,
        user: {
          userId: result.insertedId.toString(),
          email,
          username: newUser.username,
          name: newUser.name,
          fullName: newUser.fullName,
          avatar: newUser.avatar,
          plantCareReminders: newUser.plantCareReminders,
          newArticlesNotifications: newUser.newArticlesNotifications,
        },
        token,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in POST /api/register:", {
      message: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : undefined,
    });
    return NextResponse.json(
      { error: "Server error", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}