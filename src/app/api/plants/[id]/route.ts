// src/app/api/plants/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { Plant } from '../../../../../types/plant'; // Adjust path as per your project structure
import clientPromise from '../../../../../lib/mongodb'; // MAKE SURE THIS PATH IS CORRECT

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // This console.error will run at module load time if JWT_SECRET is missing
  console.error('CRITICAL: JWT_SECRET is not defined on the server at module load.');
}

interface TokenPayload {
  userId: string;
  email?: string;
  iat: number;
  exp: number;
}

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> } // params is a Promise
) {
  // console.log('🔍 Plant API called for ID/SLUG');

  if (!JWT_SECRET) {
    // This check is for runtime, in case it was set after module load (unlikely for env vars)
    console.error('CRITICAL-RUNTIME: JWT_SECRET is not defined.');
    return NextResponse.json({ error: 'Server configuration error: JWT_SECRET missing.' }, { status: 500 });
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

  const resolvedParams = await paramsPromise; // Await the params promise
  const { id } = resolvedParams;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return NextResponse.json({ error: 'Invalid or missing ID.' }, { status: 400 });
  }

  const cleanId = id.trim();
  // MONGODB_URI check is now primarily in lib/mongodb.ts
  // if (!process.env.MONGODB_URI) {
  //   return NextResponse.json({ error: 'Server configuration error: MONGODB_URI is missing.' }, { status: 500 });
  // }

  try {
    const client = await clientPromise; // Use the shared client
    const db = client.db('plantdb'); // Use your actual DB name
    const collection = db.collection('plants');

    let plantDoc = null;
    const startQueryTime = Date.now();

    // Try by slug (exact match) - Ensure 'slug' is indexed
    plantDoc = await collection.findOne({ slug: cleanId });
    // console.log(`Query by slug took ${Date.now() - startQueryTime}ms`);

    // Try case-insensitive slug (if not found by exact slug) - Ensure 'slug' is indexed, consider collation for performance
    if (!plantDoc) {
      const ciStartTime = Date.now();
      plantDoc = await collection.findOne({ slug: { $regex: `^${cleanId}$`, $options: 'i' } });
      // console.log(`Query by case-insensitive slug took ${Date.now() - ciStartTime}ms`);
    }
    
    // Try ObjectId (if not found by slug and cleanId is a valid ObjectId) - _id is indexed by default
    if (!plantDoc && ObjectId.isValid(cleanId)) {
      const oidStartTime = Date.now();
      plantDoc = await collection.findOne({ _id: new ObjectId(cleanId) });
      // console.log(`Query by ObjectId took ${Date.now() - oidStartTime}ms`);
    }
    
    // Try name (case-insensitive) - Ensure 'name' is indexed
    if (!plantDoc) {
      const nameQuery = cleanId.replace(/-/g, ' ');
      const nameStartTime = Date.now();
      plantDoc = await collection.findOne({ name: { $regex: `^${nameQuery}$`, $options: 'i' } });
      // console.log(`Query by name took ${Date.now() - nameStartTime}ms`);
    }
    // console.log(`Total query time for plant ${cleanId}: ${Date.now() - startQueryTime}ms`);

    if (!plantDoc) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    const formatted: Plant = {
      _id: plantDoc._id?.toString() || '',
      name: plantDoc.name || 'Unknown Plant',
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
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (err: any) {
    console.error(`Failed to fetch plant with id/slug ${cleanId}:`, err);
    return NextResponse.json(
      { error: 'Failed to fetch plant', details: process.env.NODE_ENV === 'development' ? err.message : undefined },
      { status: 500 }
    );
  }
}