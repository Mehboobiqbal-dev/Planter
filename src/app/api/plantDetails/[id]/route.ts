import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Extract and validate ID
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid plant ID' }, { status: 400 });
  }

  // Connect to MongoDB
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ error: 'MONGODB_URI is not defined' }, { status: 500 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('plantdb');
    const collection = db.collection('plants');

    const plant = await collection.findOne({ _id: new ObjectId(id) });
    if (!plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    const formatted = {
      _id: plant._id.toString(),
      name: plant.name,
      latin: plant.latin,
      category: plant.category,
      image: plant.image,
      description: plant.description,
      invitation: plant.invitation,
      fullDescription: plant.fullDescription,
      images: plant.images,
      care: plant.care,
      careRequirements: plant.careRequirements,
      careSections: plant.careSections,
      funFact: plant.funFact,
      commonName: plant.commonName,
      slug: plant.slug,
      toxicity: plant.toxicity,
      difficulty: plant.difficulty,
      humidity: plant.humidity,
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (err) {
    console.error(`Error fetching plant for id ${id}:`, err);
    return NextResponse.json({ error: 'Failed to fetch plant' }, { status: 500 });
  } finally {
    await client.close();
  }
}
