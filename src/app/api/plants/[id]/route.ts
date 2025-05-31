// src/app/api/plants/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { Plant } from '../../../../../types/plant'; // Adjust path as per your project structure
import clientPromise from '../../../../../lib/mongodb'; // MAKE SURE THIS PATH IS CORRECT

// JWT_SECRET and TokenPayload are no longer needed here

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // params is directly available in App Router
) {
  console.log(`[API /api/plants/[id]] GET request for id/slug: ${params.id}`);

  const { id } = params;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.warn('[API /api/plants/[id]] Invalid or missing ID.');
    return NextResponse.json({ error: 'Invalid or missing ID.' }, { status: 400 });
  }

  const cleanId = id.trim();

  try {
    const client = await clientPromise;
    const db = client.db('plantdb'); // Use your actual DB name
    const collection = db.collection('plants');

    let plantDoc = null;
    const startQueryTime = Date.now();
    console.log(`[API /api/plants/[id]] Searching for plant with identifier: ${cleanId}`);

    // Try by slug (exact match) - Ensure 'slug' is indexed
    plantDoc = await collection.findOne({ slug: cleanId });
    if (plantDoc) console.log(`[API /api/plants/[id]] Found by exact slug match.`);

    // Try case-insensitive slug (if not found by exact slug) - Ensure 'slug' is indexed, consider collation for performance
    if (!plantDoc) {
      plantDoc = await collection.findOne({ slug: { $regex: `^${cleanId}$`, $options: 'i' } });
      if (plantDoc) console.log(`[API /api/plants/[id]] Found by case-insensitive slug match.`);
    }

    // Try ObjectId (if not found by slug and cleanId is a valid ObjectId) - _id is indexed by default
    if (!plantDoc && ObjectId.isValid(cleanId)) {
      plantDoc = await collection.findOne({ _id: new ObjectId(cleanId) });
      if (plantDoc) console.log(`[API /api/plants/[id]] Found by ObjectId match.`);
    }

    // Try name (case-insensitive) - Ensure 'name' is indexed
    if (!plantDoc) {
      const nameQuery = cleanId.replace(/-/g, ' '); // Allow for slugs like "snake-plant" to match "snake plant"
      plantDoc = await collection.findOne({ name: { $regex: `^${nameQuery}$`, $options: 'i' } });
      if (plantDoc) console.log(`[API /api/plants/[id]] Found by case-insensitive name match: ${nameQuery}`);
    }
    console.log(`[API /api/plants/[id]] Total query time for plant ${cleanId}: ${Date.now() - startQueryTime}ms`);

    if (!plantDoc) {
      console.warn(`[API /api/plants/[id]] Plant not found for identifier: ${cleanId}`);
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    // Ensure all fields in the Plant type are handled, providing defaults
    const formatted: Plant = {
      _id: plantDoc._id?.toString() || '',
      name: plantDoc.name || 'Unknown Plant',
      category: plantDoc.category || 'Unknown',
      image: plantDoc.image || '/images/default-plant.jpg', // Provide a default image path
      latin: plantDoc.latin || undefined,
      description: plantDoc.description || '',
      invitation: plantDoc.invitation || undefined,
      fullDescription: plantDoc.fullDescription || undefined,
      images: Array.isArray(plantDoc.images) ? plantDoc.images : [],
      care: plantDoc.care && typeof plantDoc.care === 'object' ? plantDoc.care : undefined,
      careRequirements: Array.isArray(plantDoc.careRequirements) ? plantDoc.careRequirements : [],
      careSections: Array.isArray(plantDoc.careSections) ? plantDoc.careSections : [],
      funFact: plantDoc.funFact || undefined,
      commonName: plantDoc.commonName || undefined,
      slug: plantDoc.slug || undefined,
      toxicity: plantDoc.toxicity || null, // Keep as null if that's the intended default
      difficulty: plantDoc.difficulty || undefined,
      humidity: plantDoc.humidity || undefined,
      detailId: plantDoc.detailId || null, // Keep as null if that's the intended default
    };
    console.log(`[API /api/plants/[id]] Successfully fetched and formatted plant: ${formatted.name}`);
    return NextResponse.json(formatted, { status: 200 });

  } catch (err: any) {
    console.error(`[API /api/plants/[id]] Failed to fetch plant with id/slug ${cleanId}:`, err);
    return NextResponse.json(
      { error: 'Failed to fetch plant', details: process.env.NODE_ENV === 'development' ? err.message : undefined },
      { status: 500 }
    );
  }
}