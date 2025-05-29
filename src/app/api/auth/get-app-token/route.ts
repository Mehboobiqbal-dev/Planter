// File: app/api/auth/get-app-token/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import jwt from 'jsonwebtoken';
import { authOptions } from '@/app/lib/auth'; // Adjust path to your authOptions

const JWT_SECRET = process.env.JWT_SECRET;

// Define the expected structure of the user object in the session
interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  provider: string; // This comes from your CustomSession interface
}

export async function GET(req: Request) { // req is a standard Request object
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined for /api/auth/get-app-token');
    return NextResponse.json({ error: 'Server configuration error: JWT_SECRET missing.' }, { status: 500 });
  }

  // Get the NextAuth session. For App Router route handlers, call getServerSession with authOptions.
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized: No active NextAuth session' }, { status: 401 });
  }

  // Cast session.user to your expected type
  const user = session.user as SessionUser;

  // Create your application-specific JWT payload
  const appTokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    provider: user.provider, // Include provider if needed in your app JWT
    // Add any other claims your app JWT needs
  };

  try {
    const appToken = jwt.sign(appTokenPayload, JWT_SECRET, { expiresIn: '1h' }); // Adjust expiration
    return NextResponse.json({ token: appToken }, { status: 200 });
  } catch (error) {
    console.error('Error signing app token:', error);
    return NextResponse.json({ error: 'Failed to generate application token' }, { status: 500 });
  }
}