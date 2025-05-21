import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Explicitly check if the connection is ready and db is defined
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
      throw new Error("Database connection not established or db is undefined");
    }

    // Safely access the database
    const db = mongoose.connection.db;
    const users = db.collection("users");

    const { email, password } = await req.json();
    console.log(email, password);
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Define user document type to avoid @ts-ignore
    interface UserDocument {
      _id: mongoose.Types.ObjectId;
      email: string;
      password: string;
      name?: string;
      [key: string]: any;
    }

    const user = await users.findOne<UserDocument>({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Ensure JWT_SECRET is defined
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      secret,
      { expiresIn: "1h" }
    );

    // Strip out the password before replying
    const { password: _, ...userWithoutPassword } = user;

    console.log("User signed in successfully:", email);
    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
        token: token,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in POST /api/signin:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}