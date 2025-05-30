// src/app/api/plants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Plant } from '../../../../types/plant'; // Adjust path
import clientPromise from '../../../../lib/mongodb'; // MAKE SURE THIS PATH IS CORRECT

const JWT_SECRET = process.env.JWT_SECRET;
// ... (interface TokenPayload, JWT_SECRET check, auth logic same as [id] route) ...
interface TokenPayload {
  userId: string;
  email?: string;
  iat: number;
  exp: number;
}


export async function GET(request: NextRequest) {
  if (!JWT_SECRET) {
    console.error('CRITICAL-RUNTIME: JWT_SECRET is not defined for /api/plants.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or malformed token.' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err: any) {
    return NextResponse.json(
      {
        error: `Unauthorized: ${err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.'}`,
      },
      { status: 401 }
    );
  }

  if (!decoded.userId) {
    return NextResponse.json({ error: 'Unauthorized: Invalid token payload.' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('plantdb');
    const collection = db.collection('plants');

    console.time('fetchAllPlantsQuery');
    // IMPORTANT: Project only the fields you absolutely need for the "all plants" list / RelatedPlants component
    const plants = await collection.find({})
      .project({
        _id: 1,
        name: 1,
        category: 1,
        image: 1,
        slug: 1,
        latin: 1, // Only include if truly needed for previews
        // description: 0, // Explicitly exclude large fields if not needed
        // fullDescription: 0,
        // images: 0, // Probably not needed for a list view
        // care: 0,
        // careRequirements: 0,
        // careSections: 0,
      })
      .toArray();
    console.timeEnd('fetchAllPlantsQuery');

    // The mapping can also take time if plants array is huge.
    // Consider if this mapping is strictly necessary or can be simplified.
    console.time('mapAllPlants');
    const formattedPlants: Plant[] = plants.map((plantDoc: any) => ({ // Use 'any' here or a more specific projected type
      _id: plantDoc._id?.toString() || '',
      name: plantDoc.name || 'Unknown Plant',
      category: plantDoc.category || 'Unknown',
      image: plantDoc.image || '/images/default-plant.jpg',
      slug: plantDoc.slug || undefined,
      latin: plantDoc.latin || undefined,
      // Default other fields to undefined or minimal values as they might not be projected
      description: plantDoc.description || '', // Will be empty if not projected
      invitation: plantDoc.invitation || undefined,
      fullDescription: plantDoc.fullDescription || undefined,
      images: Array.isArray(plantDoc.images) ? plantDoc.images : [],
      care: plantDoc.care && typeof plantDoc.care === 'object' ? plantDoc.care : undefined,
      careRequirements: Array.isArray(plantDoc.careRequirements) ? plantDoc.careRequirements : undefined,
      careSections: Array.isArray(plantDoc.careSections) ? plantDoc.careSections : undefined,
      funFact: plantDoc.funFact || undefined,
      commonName: plantDoc.commonName || undefined,
      toxicity: plantDoc.toxicity || null,
      difficulty: plantDoc.difficulty || undefined,
      humidity: plantDoc.humidity || undefined,
      detailId: plantDoc.detailId || null,
    }));
    console.timeEnd('mapAllPlants');


    return NextResponse.json({ plants: formattedPlants }, { status: 200 });
  } catch (err: any) {
    console.error('Failed to fetch plants:', err);
    return NextResponse.json(
      { error: 'Failed to fetch plants', details: process.env.NODE_ENV === 'development' ? err.message : undefined },
      { status: 500 }
    );
  }
}