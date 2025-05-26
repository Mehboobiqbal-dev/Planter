// File: src/app/api/plants/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import clientPromise from '@/app/lib/mongodb-client';

export async function GET(request: NextRequest) {
  // 1) Fetch “plants” from MongoDB without checking for a Bearer token
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
