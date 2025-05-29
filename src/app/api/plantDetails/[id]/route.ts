// File: app/api/plant/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { Plant } from '../../../../../types/plant';

const JWT_SECRET = process.env.JWT_SECRET;

interface TokenPayload {
  userId: string;
  email?: string;
  iat: number;
  exp: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1) Confirm JWT_SECRET is set
  if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not defined on the server.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  // 2) Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('No Authorization header or malformed token');
    return NextResponse.json(
      { error: 'Unauthorized: Missing or malformed token.' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];
  let decodedPayload: TokenPayload;
  try {
    decodedPayload = jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error: any) {
    console.warn('Token verification failed:', error.message);
    return NextResponse.json(
      {
        error: `Unauthorized: ${
          error.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.'
        }`
      },
      { status: 401 }
    );
  }

  if (!decodedPayload.userId) {
    console.error('Token payload missing userId:', decodedPayload);
    return NextResponse.json({ error: 'Unauthorized: Invalid token payload.' }, { status: 401 });
  }

  // 3) Extract and log the incoming ID
  const { id } = await params;
  console.log('> [debug] Incoming ID parameter:', id);

  if (!ObjectId.isValid(id)) {
    console.warn(`Invalid ObjectId format for id=${id}`);
    return NextResponse.json({ error: 'Invalid plant ID' }, { status: 400 });
  }

  // 4) Connect to MongoDB
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
    // 5) Log which database / collection you're about to query
    const db = client.db('plantdb'); // <- Make sure “plantdb” is exactly the name you expect
    const collection = db.collection('plants');
    console.log('> [debug] Querying `plantdb.plants` for _id:', id);

    // 6) Perform the findOne
    const plant = await collection.findOne({ _id: new ObjectId(id) });
    console.log('> [debug] Raw MongoDB result:', plant);

    if (!plant) {
      console.warn(`No document found in plantdb.plants with _id=${id}`);
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    // 7) Format and return
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
