// File: app/api/plant/saved/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { Plant } from '../../../../../types/plant'; // Adjust path to your Plant type

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  // **Crucial Check 1: Is userId present?**
  if (!userId) {
    console.error("[API /api/plant/saved] userId query parameter is missing.");
    return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
  }

  // **Crucial Check 2: Basic validation of userId format (optional but good)**
  if (typeof userId !== 'string' || userId.trim() === '') {
    console.error(`[API /api/plant/saved] Invalid userId format: ${userId}`);
    return NextResponse.json({ error: 'Invalid userId format' }, { status: 400 });
  }

  console.log(`[API /api/plant/saved] Attempting to fetch plants for userId: ${userId}`); // Log the userId being processed

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('[API /api/plant/saved] MONGODB_URI is not defined');
    return NextResponse.json({ error: 'Server configuration error: MONGODB_URI is missing.' }, { status: 500 });
  }

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('plantdb'); // Ensure your database name is correct
    const savedPlantsCollection = db.collection('savedPlants');
    const plantsCollection = db.collection('plants');

    // Find saved plant entries for the given userId
    const savedPlantEntries = await savedPlantsCollection.find({ userId: userId }).toArray();

    if (savedPlantEntries.length === 0) {
      console.log(`[API /api/plant/saved] No saved plant entries found for userId: ${userId}`);
      return NextResponse.json({ plants: [] }, { status: 200 });
    }
    console.log(`[API /api/plant/saved] Found ${savedPlantEntries.length} saved plant entries for userId: ${userId}`);


    const plantIds = savedPlantEntries.map((item) => item.plantId);

    const plantObjectIds = plantIds.map(id => {
      try {
        return new ObjectId(id);
      } catch (e) {
        console.warn(`[API /api/plant/saved] Invalid ObjectId string encountered: ${id} for user ${userId}`);
        return null;
      }
    }).filter(id => id !== null) as ObjectId[];


    if (plantObjectIds.length === 0) {
        console.log(`[API /api/plant/saved] No valid plant ObjectIds after filtering for userId: ${userId}`);
        return NextResponse.json({ plants: [] }, { status: 200 });
    }

    const plantsData = await plantsCollection
      .find({ _id: { $in: plantObjectIds } })
      .toArray();
    console.log(`[API /api/plant/saved] Fetched ${plantsData.length} plant details for userId: ${userId}`);


    const formattedPlants: Plant[] = plantsData.map((plantDoc) => ({
      _id: plantDoc._id?.toString() || '',
      name: plantDoc.name || 'Unknown Plant',
      // ... (rest of your formatting, ensure it's correct)
      category: plantDoc.category || 'Unknown',
      image: plantDoc.image || '/images/default-plant.jpg',
      latin: plantDoc.latin || undefined,
      description: plantDoc.description || '',
      invitation: plantDoc.invitation || undefined,
      fullDescription: plantDoc.fullDescription || undefined,
      images: Array.isArray(plantDoc.images) ? plantDoc.images : [],
      care: plantDoc.care && typeof plantDoc.care === 'object' ? plantDoc.care : undefined,
      careRequirements: Array.isArray(plantDoc.careRequirements) ? plantDoc.careRequirements : undefined,
      careSections: Array.isArray(plantDoc.careSections) ? plantDoc.careSections : undefined,
      funFact: plantDoc.funFact || undefined,
      commonName: plantDoc.commonName || undefined,
      slug: plantDoc.slug || undefined,
      toxicity: plantDoc.toxicity || null,
      difficulty: plantDoc.difficulty || undefined,
      humidity: plantDoc.humidity || undefined,
      detailId: plantDoc.detailId || null,
    }));

    return NextResponse.json({ plants: formattedPlants }, { status: 200 });
  } catch (err: any) {
    console.error('[API /api/plant/saved] Error fetching saved plants:', err);
    return NextResponse.json(
      {
        error: 'Failed to fetch saved plants from DB',
        debug: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}