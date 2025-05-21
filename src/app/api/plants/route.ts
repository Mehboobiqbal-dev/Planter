// File: src/app/api/plants/route.ts    (or wherever your App Router handler lives)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import clientPromise from '@/app/lib/mongodb-client';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  // 1) Extract “Authorization” header and make sure it starts with “Bearer ”
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: 'Unauthorized: Missing or invalid bearer token' },
      { status: 401 }
    );
  }

  // 2) Split out the token string
  const token = authHeader.substring(7); // everything after “Bearer ”

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    // 3) Verify the token. If invalid/expired, jwt.verify() will throw.
    jwt.verify(token, secret);
    // If we reach here, the token is valid, so we can proceed to fetch data.

  } catch (err) {
    return NextResponse.json(
      { message: 'Unauthorized: Invalid or expired token' },
      { status: 401 }
    );
  }

  // 4) Now that we know the token is valid, proceed to fetch “plants” from MongoDB:
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'plantdb');
    const plantsCollection = db.collection('plants');
    const detailsCollection = db.collection('plantDetails');

    const plants = await plantsCollection.find({}).toArray();
    const details = await detailsCollection.find({}).limit(4).toArray();

    // Map plants to include detailId (first 4 plants get details)
    const plantsWithDetails = plants.map((plant, index) => ({
      ...plant,
      detailId: index < details.length ? details[index]._id : null,
    }));

    return NextResponse.json(
      { plants: plantsWithDetails },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching plants:', error);
    return NextResponse.json(
      { message: 'Failed to fetch plants' },
      { status: 500 }
    );
  }
}

// If you want to keep protecting *only* /api/plants, you can omit `matcher` here.
// By default, because this lives under app/api/plants/route.ts, Next will only call it on GET /api/plants.
// In a “pages/”‐based file, you’d also want to ensure your middleware covers “/api/plants” as well.
