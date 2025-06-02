// File: app/api/plant/unsave/route.ts
import { MongoClient } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

interface UnsavePlantRequest {
  userId: string;
  plantId: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, plantId } = (await req.json()) as UnsavePlantRequest;

    if (!userId || !plantId) {
      return NextResponse.json({ error: 'userId and plantId are required' }, { status: 400 });
    }

    // Validate userId and plantId as strings
    if (typeof userId !== 'string' || typeof plantId !== 'string') {
      return NextResponse.json({ error: 'Invalid userId or plantId format' }, { status: 400 });
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('[API /api/plant/unsave] MONGODB_URI is not defined');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const client = new MongoClient(uri);
    try {
      await client.connect();
      const database = client.db('plantdb'); // Ensure your database name is correct
      const savedPlantsCollection = database.collection('savedPlants');

      // Check if the plant record exists to be unsaved
      const existing = await savedPlantsCollection.findOne({ userId, plantId });
      if (!existing) {
        // It's often fine to return a success-like status even if it wasn't there,
        // as the desired state (not saved) is achieved.
        // Or you could return a 404 if you want to be strict.
        console.log(`[API /api/plant/unsave] Plant with plantId: ${plantId} not found for userId: ${userId}. No action taken.`);
        return NextResponse.json({ message: 'Plant not found in saved list or already unsaved' }, { status: 200 });
      }

      // Unsave the plant (delete the entry)
      const deleteResult = await savedPlantsCollection.deleteOne({
        userId,
        plantId,
      });

      if (deleteResult.deletedCount === 1) {
        console.log(`[API /api/plant/unsave] Plant with plantId: ${plantId} unsaved successfully for userId: ${userId}.`);
        return NextResponse.json({ message: 'Plant unsaved successfully' }, { status: 200 });
      } else {
        // This case should ideally not be hit if 'existing' check passed,
        // but it's good for robustness (e.g., race conditions, though less likely here).
        console.warn(`[API /api/plant/unsave] Plant with plantId: ${plantId} for userId: ${userId} was found but not deleted. DeteledCount: ${deleteResult.deletedCount}`);
        return NextResponse.json({ message: 'Plant was found but could not be unsaved' }, { status: 500 });
      }

    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('[API /api/plant/unsave] Error unsaving plant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined }, { status: 500 });
  }
}