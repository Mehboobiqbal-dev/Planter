import { MongoClient } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

interface SavePlantRequest {
  userId: string;
  plantId: string;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token || token !== process.env.INTERNAL_API_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, plantId } = await req.json();

    if (!userId || !plantId) {
      return NextResponse.json({ error: 'userId and plantId are required' }, { status: 400 });
    }

    if (typeof userId !== 'string' || typeof plantId !== 'string') {
      return NextResponse.json({ error: 'Invalid userId or plantId format' }, { status: 400 });
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return NextResponse.json({ error: 'MONGODB_URI is not defined' }, { status: 500 });
    }

    const client = new MongoClient(uri);
    try {
      await client.connect();
      const database = client.db('plantdb');
      const savedPlants = database.collection('savedPlants');

      const existing = await savedPlants.findOne({ userId, plantId });
      if (existing) {
        return NextResponse.json({ message: 'Plant already saved' }, { status: 200 });
      }

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}