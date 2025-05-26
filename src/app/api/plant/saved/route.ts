import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { Plant } from '../../../../../types/plant'; // Adjust path based on your project structure

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    const client = new MongoClient(uri);
    try {
      await client.connect();
      const database = client.db('plantdb');
      const savedPlantsCollection = database.collection('savedPlants');
      const plantsCollection = database.collection('plants');

      // Find saved plant IDs for the user
      const savedPlants = await savedPlantsCollection
        .find({ userId })
        .toArray();

      // Fetch full plant details
      const plantIds = savedPlants.map((sp) => sp.plantId);
      const plantsFromDb = await plantsCollection
        .find({ _id: { $in: plantIds.map((id) => new ObjectId(id)) } })
        .toArray();

      const plants: Plant[] = plantsFromDb.map((doc) => ({
        _id: doc._id.toString(),
        name: doc.name,
        category: doc.category,
        image: doc.image,
        description: doc.description,
      }));

      return NextResponse.json({ plants }, { status: 200 });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error fetching saved plants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}