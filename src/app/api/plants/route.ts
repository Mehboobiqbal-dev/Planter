import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(request: NextRequest) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ error: 'MONGODB_URI is not defined' }, { status: 500 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('plantdb');
    const collection = db.collection('plants');

    const plants = await collection.find({}).toArray();
    const formattedPlants = plants.map(plant => ({
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
      detailId: plant._id.toString(),
    }));

    return NextResponse.json({ plants: formattedPlants }, { status: 200 });
  } catch (err) {
    console.error('Error fetching plants:', err);
    return NextResponse.json({ error: 'Failed to fetch plants' }, { status: 500 });
  } finally {
    await client.close();
  }
}