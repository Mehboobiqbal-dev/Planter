import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb'; // Added ObjectId import
import jwt from 'jsonwebtoken';
import { Plant } from '../../../../../types/plant';

const JWT_SECRET = process.env.JWT_SECRET;

interface TokenPayload {
  userId: string;
  email?: string;
  iat: number;
  exp: number;
}

export async function GET(request: NextRequest) {
  if (!JWT_SECRET) {
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

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    return NextResponse.json({ error: 'Server configuration error: MONGODB_URI is missing.' }, { status: 500 });
  }

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('plantdb');
    const savedPlants = db.collection('savedPlants');
    const plantsCollection = db.collection('plants');

    const saved = await savedPlants.find({ userId: decoded.userId }).toArray();
    const plantIds = saved.map((item) => item.plantId);

    const plants = await plantsCollection
      .find({ _id: { $in: plantIds.map((id) => new ObjectId(id)) } })
      .toArray();

    const formattedPlants: Plant[] = plants.map((plantDoc) => ({
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
    }));

    return NextResponse.json({ plants: formattedPlants }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to fetch saved plants', debug: process.env.NODE_ENV === 'development' ? err.message : undefined },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}