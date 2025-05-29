// File: app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb-client'; // Adjust path if needed
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

// Define UserDocument interface (can be shared if defined elsewhere)
interface UserDocument {
  _id: ObjectId;
  email: string;
  name?: string;
  password?: string;
  provider?: string;
  fullName?: string;
  username?: string;
  avatar?: string;
  plantCareReminders?: boolean;
  newArticlesNotifications?: boolean;
  [key: string]: any;
}

export async function POST(req: NextRequest) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined for /api/login');
    return NextResponse.json({ error: 'Server configuration error: JWT_SECRET missing.' }, { status: 500 });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(); // Ensure your DB name is correct or configured in clientPromise
    const usersCollection = db.collection<UserDocument>('users');

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.password) {
      // User might exist from an OAuth registration
      return NextResponse.json({ error: 'Account exists but not with password. Try social login or reset password if applicable.' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        username: user.username || email.split('@')[0], // Fallback for username
      },
      JWT_SECRET,
      { expiresIn: '1h' } // Adjust expiration as needed
    );

    // Prepare user data without sensitive fields
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          username: user.username || email.split('@')[0],
          fullName: user.fullName,
          avatar: user.avatar,
        },
        token,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error during login';
    return NextResponse.json({ error: 'Server error during login', details: errorMessage }, { status: 500 });
  }
}