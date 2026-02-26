import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { Plant } from '../../../../../types/plant';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Extract and log the incoming ID
  const { id } = await params;
  console.log('> [debug] Incoming ID parameter:', id);

  if (!ObjectId.isValid(id)) {
    console.warn(`Invalid ObjectId format for id=${id}`);
    return NextResponse.json({ error: 'Invalid plant ID' }, { status: 400 });
  }

  // Connect to MongoDB
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined');
    return NextResponse.json(
      { error: 'Server configuration error: MONGODB_URI is not defined' },
      { status: 500 }
    );
  }

  console.log('> [debug] Connecting to MongoDB with URI:', uri.replace(/\/\/[^:]+:[^@]+@/,'//****:****@'));

  const client = new MongoClient(uri);
  try {
    await client.connect();
    // Log which database / collection you're about to query
    const db = client.db('plantdb');
    const collection = db.collection('plants');
    console.log('> [debug] Querying `plantdb.plants` for _id:', id);

    // Perform the findOne
    const plant = await collection.findOne({ _id: new ObjectId(id) });
    console.log('> [debug] Raw MongoDB result:', plant);

    if (!plant) {
      console.warn(`No document found in plantdb.plants with _id=${id}`);
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    // Format and return
    const formattedPlant: Plant = {
      _id: plant._id.toString(),
      name: plant.name || 'Unknown Plant',
      category: plant.category || 'Unknown',
      image: plant.image || '/images/default-plant.jpg',
      latin: plant.latin || '',
      description: plant.description || '',
      invitation: plant.invitation || '',
      fullDescription: plant.fullDescription || '',
      images: Array.isArray(plant.images) ? plant.images : [],
      care: plant.care || {},
      careRequirements: Array.isArray(plant.careRequirements)
        ? plant.careRequirements
        : [],
      careSections: Array.isArray(plant.careSections) ? plant.careSections : [],
      funFact: plant.funFact || '',
      commonName: plant.commonName || '',
      slug: plant.slug || '',
      toxicity: plant.toxicity || '',
      difficulty: plant.difficulty || '',
      humidity: plant.humidity || '',
      detailId: plant.detailId || '',
    };

    console.log('> [debug] Sending formatted plant back to client.');
    return NextResponse.json(formattedPlant, { status: 200 });
  } catch (err) {
    console.error(`Error fetching plant for id ${id}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json(
      {
        error: 'Failed to fetch plant',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}