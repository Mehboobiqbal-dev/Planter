// File: app/api/plant/save/route.ts
import { MongoClient } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

interface SavePlantRequest {
  userId: string;
  plantId: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, plantId } = (await req.json()) as SavePlantRequest;

    if (!userId || !plantId) {
      return NextResponse.json({ error: 'userId and plantId are required' }, { status: 400 });
    }

    // Validate userId and plantId as strings
    if (typeof userId !== 'string' || typeof plantId !== 'string') {
      return NextResponse.json({ error: 'Invalid userId or plantId format' }, { status: 400 });
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI is not defined');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const client = new MongoClient(uri);
    try {
      await client.connect();
      const database = client.db('plantdb'); // Ensure your database name is correct
      const savedPlants = database.collection('savedPlants');

      // Check if the plant is already saved by the user
      const existing = await savedPlants.findOne({ userId, plantId });
      if (existing) {
        return NextResponse.json({ message: 'Plant already saved' }, { status: 200 });
      }

      // Save the plant
      await savedPlants.insertOne({
        userId,
        plantId,
        savedAt: new Date(),
      });

      return NextResponse.json({ message: 'Plant saved successfully' }, { status: 201 });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error saving plant:', error);
    // Avoid sending detailed error messages to the client in production
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined }, { status: 500 });
  }
}