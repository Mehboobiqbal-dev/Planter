
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: 'Unauthorized: Missing or invalid bearer token' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, secret) as { id: string; email: string; name?: string };
    const displayName = decoded.email || decoded.name || 'User';
    return NextResponse.json(
      { message: `Hello, ${displayName}! This is a protected route.` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Unauthorized: Invalid token' },
      { status: 401 }
    );
  }
}
