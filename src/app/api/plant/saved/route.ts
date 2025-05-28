import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }

  if (!ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ error: 'MONGODB_URI is not defined' }, { status: 500 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('plantdb');
    const collection = db.collection('savedPlants');

    // Query saved plants for the user
    const savedPlants = await collection.find({ userId: new ObjectId(userId) }).toArray();

    // Format response
    const formattedPlants = savedPlants.map(saved => ({
      _id: saved.plantId.toString(),
      userId: saved.userId.toString(),
      savedAt: saved.savedAt,
      // Add other fields as needed
    }));

    return NextResponse.json(formattedPlants, { status: 200 });
  } catch (err) {
    console.error(`Error fetching saved plants for userId ${userId}:`, err);
    return NextResponse.json({ error: 'Failed to fetch saved plants' }, { status: 500 });
  } finally {
    await client.close();
  }
}