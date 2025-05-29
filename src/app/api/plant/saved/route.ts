// File: app/api/plant/saved/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { Plant } from '../../../../../types/plant'; // Adjust path as needed
import jwt from 'jsonwebtoken'; // For verifying the token

const JWT_SECRET = process.env.JWT_SECRET;

interface TokenPayload {
  userId: string;
  email?: string; // Optional, depending on what you put in the token
  iat: number;
  exp: number;
}

export async function GET(request: NextRequest) {
  if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not defined on the server for /api/plant/saved.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or malformed token.' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  let decodedPayload: TokenPayload;
  try {
    decodedPayload = jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error: any) {
    console.warn('Token verification failed:', error.message);
    return NextResponse.json({ error: `Unauthorized: ${error.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.'}` }, { status: 401 });
  }

  if (!decodedPayload.userId) {
    console.error('Token payload missing userId:', decodedPayload);
    return NextResponse.json({ error: 'Unauthorized: Invalid token payload.' }, { status: 401 });
  }

  const userIdToFetch = decodedPayload.userId;

  // Ensure userId from token is a valid ObjectId string if your DB stores user IDs as ObjectIds
  // For NextAuth, user.id is usually a string, which might or might not be an ObjectId string
  // depending on your adapter and DB schema. If it's an ObjectId, you might need:
  // if (!ObjectId.isValid(userIdToFetch)) {
  //    return NextResponse.json({ error: 'Invalid user identifier in token.' }, { status: 400 });
  // }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined');
    return NextResponse.json({ error: 'Server configuration error: MONGODB_URI is not defined' }, { status: 500 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("plantdb"); // Ensure this is your database name
    const savedPlantsCollection = db.collection('savedPlants');
    const plantsCollection = db.collection('plants');

    const userSavedEntries = await savedPlantsCollection.find({ userId: userIdToFetch }).toArray();

    if (userSavedEntries.length === 0) {
      return NextResponse.json({ plants: [] }, { status: 200 });
    }

    const plantIdStrings = userSavedEntries.map((saved) => saved.plantId as string);
    const plantObjectIds = plantIdStrings
      .map((idStr) => {
        if (typeof idStr === 'string' && ObjectId.isValid(idStr)) {
          return new ObjectId(idStr);
        }
        console.warn(`Invalid plantId format skipped: ${idStr} for user ${userIdToFetch}`);
        return null;
      })
      .filter((id): id is ObjectId => id !== null);

    if (plantObjectIds.length === 0) {
      console.warn(`No valid plant ObjectIds found for user ${userIdToFetch} after filtering.`);
      return NextResponse.json({ plants: [] }, { status: 200 });
    }

    const plantsFromDb = await plantsCollection.find({ _id: { $in: plantObjectIds } }).toArray();

    const formattedPlants: Plant[] = plantsFromDb.map((plantDoc: any) => ({
      _id: plantDoc._id.toString(),
      name: plantDoc.name || 'Unknown Plant',
      category: plantDoc.category || 'Unknown',
      image: plantDoc.image || '/images/default-plant.jpg',
      latin: plantDoc.latin || '',
      description: plantDoc.description || '',
      invitation: plantDoc.invitation || '',
      fullDescription: plantDoc.fullDescription || '',
      images: Array.isArray(plantDoc.images) ? plantDoc.images : [],
      care: plantDoc.care || {},
      careRequirements: plantDoc.careRequirements || {},
      careSections: Array.isArray(plantDoc.careSections) ? plantDoc.careSections : [],
      funFact: plantDoc.funFact || '',
      commonName: plantDoc.commonName || '',
      slug: plantDoc.slug || '',
      toxicity: plantDoc.toxicity || '',
      difficulty: plantDoc.difficulty || '',
      humidity: plantDoc.humidity || '',
      detailId: plantDoc.detailId || '',
    }));

    return NextResponse.json({ plants: formattedPlants }, { status: 200 });
  } catch (err) {
    console.error(`Error fetching saved plants for userId ${userIdToFetch} (from token):`, err);
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json(
      { error: 'Failed to fetch saved plants', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}