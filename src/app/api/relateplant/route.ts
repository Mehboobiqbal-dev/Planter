import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Interfaces for type safety
interface Plant {
  _id: string;
  name: string;
  category: string;
  image: string;
  latin: string;
  description?: string;
  slug?: string;
}

interface PlantDocument {
  _id: ObjectId;
  name: string;
  category: string;
  image: string;
  latin: string;
  description?: string;
  slug?: string;
}

interface ApiPlantSearchResponse {
  plants: Plant[];
}

interface RequestBody {
  name: string;
}

export async function POST(request: NextRequest) {
  console.log('[API /api/plant-search] POST request received.');

  try {
    // Parse request body
    const body: RequestBody = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      console.warn('[API /api/plant-search] Invalid or missing name parameter.');
      return NextResponse.json(
        { error: 'Name parameter is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    console.log(`[API /api/plant-search] Searching for plant by Latin name: ${name}`);

    // Connect to MongoDB
    console.time('[API /api/plant-search] ClientAcquired');
    const client = await clientPromise;
    console.timeEnd('[API /api/plant-search] ClientAcquired');

    const database = client.db(process.env.MONGODB_DB_NAME || 'plantdb');
    const plantCollection = database.collection<PlantDocument>('plants');

    // Perform case-insensitive search for plants with matching Latin name
    console.time('[API /api/plant-search] FetchPlants');
    const plantsFromDb = await plantCollection
      .find(
        { latin: { $regex: name, $options: 'i' } }, // Case-insensitive regex search on latin field
        {
          projection: { _id: 1, name: 1, category: 1, image: 1, latin: 1, description: 1, slug: 1 },
        }
      )
      .limit(50) // Limit results to prevent excessive data
      .toArray();
    console.timeEnd('[API /api/plant-search] FetchPlants');

    const plants: Plant[] = plantsFromDb.map((doc) => ({
      _id: doc._id.toString(),
      name: doc.name,
      category: doc.category,
      image: doc.image,
      latin: doc.latin,
      description: doc.description || '',
      slug: doc.slug,
    }));

    console.log(`[API /api/plant-search] Found ${plants.length} plants matching Latin name: ${name}`);

    const responseData: ApiPlantSearchResponse = {
      plants,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[API /api/plant-search] Critical error in API route:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown internal server error occurred.';
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}