// src/app/api/plants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Plant } from '../../../../types/plant'; // Adjust path
import clientPromise from '../../../../lib/mongodb'; // MAKE SURE THIS PATH IS CORRECT

// JWT_SECRET and TokenPayload are no longer needed here

export async function GET(request: NextRequest) {
  console.log('[API /api/plants] GET request received for all plants.');

  try {
    const client = await clientPromise;
    const db = client.db('plantdb'); // Use your actual DB name
    const collection = db.collection('plants');

    console.time('[API /api/plants] fetchAllPlantsQuery');
    // Project only necessary fields for a list/preview
    const plantsFromDb = await collection.find({})
      .project({
        _id: 1,
        name: 1,
        category: 1,
        image: 1,
        slug: 1,
        latin: 1,
        description: 1, // Include if short description is used in previews
        // Explicitly exclude fields not needed for a general list:
        // fullDescription: 0,
        // images: 0, // Usually not needed for a list of many plants
        // care: 0,
        // careRequirements: 0,
        // careSections: 0,
        // funFact: 0,
      })
      .toArray();
    console.timeEnd('[API /api/plants] fetchAllPlantsQuery');
    console.log(`[API /api/plants] Fetched ${plantsFromDb.length} plants from DB.`);

    console.time('[API /api/plants] mapAllPlants');
    const formattedPlants: Plant[] = plantsFromDb.map((plantDoc: any) => ({
      _id: plantDoc._id?.toString() || '',
      name: plantDoc.name || 'Unknown Plant',
      category: plantDoc.category || 'Unknown',
      image: plantDoc.image || '/images/default-plant.jpg',
      slug: plantDoc.slug || undefined,
      latin: plantDoc.latin || undefined,
      description: plantDoc.description || '', // Fallback for description
      // Default other fields from Plant type to undefined or sensible defaults if not projected
      invitation: plantDoc.invitation || undefined,
      fullDescription: plantDoc.fullDescription || undefined, // Will be undefined if not projected
      images: Array.isArray(plantDoc.images) ? plantDoc.images : [], // Will be empty if not projected
      care: plantDoc.care && typeof plantDoc.care === 'object' ? plantDoc.care : undefined,
      careRequirements: Array.isArray(plantDoc.careRequirements) ? plantDoc.careRequirements : [],
      careSections: Array.isArray(plantDoc.careSections) ? plantDoc.careSections : [],
      funFact: plantDoc.funFact || undefined,
      commonName: plantDoc.commonName || undefined,
      toxicity: plantDoc.toxicity || null,
      difficulty: plantDoc.difficulty || undefined,
      humidity: plantDoc.humidity || undefined,
      detailId: plantDoc.detailId || null,
    }));
    console.timeEnd('[API /api/plants] mapAllPlants');

    console.log(`[API /api/plants] Successfully formatted ${formattedPlants.length} plants.`);
    return NextResponse.json({ plants: formattedPlants }, { status: 200 });

  } catch (err: any) {
    console.error('[API /api/plants] Failed to fetch plants:', err);
    return NextResponse.json(
      { error: 'Failed to fetch plants', details: process.env.NODE_ENV === 'development' ? err.message : undefined },
      { status: 500 }
    );
  }
}