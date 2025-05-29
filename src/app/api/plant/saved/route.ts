import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { Plant } from '../../../../../types/plant'; // Adjusted path if needed

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  // Handle undefined userId
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }

  // Validate userId is a string
  if (typeof userId !== 'string') {
    return NextResponse.json({ error: 'Invalid userId format' }, { status: 400 });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ error: 'MONGODB_URI is not defined' }, { status: 500 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('plantdb');
    const savedPlantsCollection = db.collection('savedPlants');
    const plantsCollection = db.collection('plants');

    // Fetch saved plants for the user (query userId as string)
    const savedPlants = await savedPlantsCollection.find({ userId }).toArray();

    // Fetch full plant details for each saved plant
    const plantIds = savedPlants.map((saved) => saved.plantId);
    const plants = await plantsCollection.find({ _id: { $in: plantIds } }).toArray();

    // Format plants to match Plant interface, converting ObjectId to string
    const formattedPlants: Plant[] = plants.map((plant) => ({
      _id: plant._id.toString(), // Convert ObjectId to string
      name: plant.name || 'Unknown Plant',
      category: plant.category || 'Unknown',
      image: plant.image || '/images/default-plant.jpg',
      latin: plant.latin,
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
      detailId: plant.detailId,
    }));

    return NextResponse.json({ plants: formattedPlants }, { status: 200 });
  } catch (err) {
    console.error(`Error fetching saved plants for userId ${userId}:`, err);
    return NextResponse.json({ error: 'Failed to fetch saved plants' }, { status: 500 });
  } finally {
    await client.close();
  }
}