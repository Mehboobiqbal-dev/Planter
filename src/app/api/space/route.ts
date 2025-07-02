import { ObjectId, Db, MongoClient } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb-client';

interface PostSpaceRequest {
  action: 'createSpace' | 'addPlant' | 'removePlant' | 'deleteSpace';
  userId: string; // Can be either username or _id
  spaceId?: string;
  spaceName?: string;
  plantId?: string;
}

interface Space {
  _id: ObjectId;
  userId: ObjectId; // Changed to ObjectId to match MongoDB schema
  name: string;
  createdAt: Date;
}

// Temporary Plant interface to avoid import issues
interface Plant {
  _id: string;
  name: string;
  category: string;
  image: string;
  latin?: string;
  description?: string;
  invitation?: string;
  fullDescription?: string;
  images?: any[];
  care?: Record<string, string>;
  careRequirements?: any[];
  careSections?: any[];
  funFact?: string;
  commonName?: string;
  slug?: string;
  toxicity?: string | null;
  difficulty?: string;
  humidity?: string;
  detailId?: string | null | undefined;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    let userId = searchParams.get('userId');
    const spaceId = searchParams.get('spaceId');

    // Validate userId
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Valid userId or username is required' }, { status: 400 });
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI is not defined');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const client = new MongoClient(uri);
    try {
      await client.connect();
      const database = client.db('plantdb');
      const spacesCollection = database.collection('spaces');
      const spacePlantsCollection = database.collection('spacePlants');
      const plantsCollection = database.collection('plants');
      const usersCollection = database.collection('users');

      // Convert username to _id if necessary
      let actualUserId: string;
      try {
        // Check if userId is a valid ObjectId
        new ObjectId(userId);
        actualUserId = userId;
      } catch (e) {
        // If not a valid ObjectId, assume it's a username
        const user = await usersCollection.findOne({ username: userId });
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        actualUserId = user._id.toString();
      }

      switch (action) {
        case 'listSpaces':
          // Query with both string and ObjectId userId to handle existing data
          const spaces = await spacesCollection.find({
            $or: [
              { userId: actualUserId },
              { userId: new ObjectId(actualUserId) }
            ]
          }).toArray();
          const formattedSpaces = spaces.map(space => ({
            ...space,
            _id: space._id.toString(),
            userId: typeof space.userId === 'string' ? space.userId : space.userId.toString(),
          }));
          return NextResponse.json({ spaces: formattedSpaces }, { status: 200 });

        case 'getSpacePlants':
          if (!spaceId) {
            return NextResponse.json({ error: 'spaceId is required' }, { status: 400 });
          }

          // Verify space exists and belongs to user (check both string and ObjectId)
          const space = await spacesCollection.findOne({
            _id: new ObjectId(spaceId),
            $or: [
              { userId: actualUserId },
              { userId: new ObjectId(actualUserId) }
            ]
          });
          if (!space) {
            return NextResponse.json({ error: 'Space not found or user is not authorized' }, { status: 404 });
          }

          const spacePlants = await spacePlantsCollection.find({ spaceId }).toArray();
          if (spacePlants.length === 0) {
            return NextResponse.json({ plants: [] }, { status: 200 });
          }

          const plantIds = spacePlants
            .map(item => {
              try {
                return new ObjectId(item.plantId);
              } catch (e) {
                console.warn(`Invalid ObjectId: ${item.plantId}`);
                return null;
              }
            })
            .filter(id => id !== null) as ObjectId[];

          const plantsData = await plantsCollection.find({ _id: { $in: plantIds } }).toArray();

          const formattedPlants: Plant[] = plantsData.map((plantDoc) => ({
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

        default:
          return NextResponse.json({ error: 'Invalid action for GET request' }, { status: 400 });
      }
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error processing GET request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, userId, spaceId, spaceName, plantId } = (await req.json()) as PostSpaceRequest;

    // Validate userId
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Valid userId or username is required' }, { status: 400 });
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI is not defined');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const client = new MongoClient(uri);
    try {
      await client.connect();
      const database = client.db('plantdb');
      const spacesCollection = database.collection('spaces');
      const spacePlantsCollection = database.collection('spacePlants');
      const plantsCollection = database.collection('plants');
      const usersCollection = database.collection('users');

      // Convert username to _id if necessary
      let actualUserId: string;
      try {
        // Check if userId is a valid ObjectId
        new ObjectId(userId);
        actualUserId = userId;
      } catch (e) {
        // If not a valid ObjectId, assume it's a username
        const user = await usersCollection.findOne({ username: userId });
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        actualUserId = user._id.toString();
      }

      switch (action) {
        case 'createSpace':
          if (!spaceName || typeof spaceName !== 'string') {
            return NextResponse.json({ error: 'spaceName is required for creating a space' }, { status: 400 });
          }

          const newSpace: Space = {
            _id: new ObjectId(),
            userId: new ObjectId(actualUserId),
            name: spaceName,
            createdAt: new Date(),
          };

          await spacesCollection.insertOne(newSpace);
          return NextResponse.json(
            { message: 'Space created successfully', space: { ...newSpace, _id: newSpace._id.toString(), userId: newSpace.userId.toString() } },
            { status: 201 }
          );

        case 'addPlant':
          if (!spaceId || !plantId) {
            return NextResponse.json({ error: 'spaceId and plantId are required' }, { status: 400 });
          }

          // Verify space exists and belongs to user (check both string and ObjectId)
          const space = await spacesCollection.findOne({
            _id: new ObjectId(spaceId),
            $or: [
              { userId: actualUserId },
              { userId: new ObjectId(actualUserId) }
            ]
          });
          if (!space) {
            return NextResponse.json({ error: 'Space not found or not authorized' }, { status: 404 });
          }

          // Check if plant exists
          const plantExists = await plantsCollection.findOne({ _id: new ObjectId(plantId) });
          if (!plantExists) {
            return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
          }

          // Check if plant is already in space
          const existingPlant = await spacePlantsCollection.findOne({ spaceId, plantId });
          if (existingPlant) {
            return NextResponse.json({ message: 'Plant already in space' }, { status: 200 });
          }

          await spacePlantsCollection.insertOne({
            spaceId,
            plantId,
            userId: new ObjectId(actualUserId),
            addedAt: new Date(),
          });
          return NextResponse.json({ message: 'Plant added to space successfully' }, { status: 201 });

        case 'removePlant':
          if (!spaceId || !plantId) {
            return NextResponse.json({ error: 'spaceId and plantId are required' }, { status: 400 });
          }

          // Verify space exists and belongs to user (check both string and ObjectId)
          const spaceForRemove = await spacesCollection.findOne({
            _id: new ObjectId(spaceId),
            $or: [
              { userId: actualUserId },
              { userId: new ObjectId(actualUserId) }
            ]
          });
          if (!spaceForRemove) {
            return NextResponse.json({ error: 'Space not found or not authorized' }, { status: 404 });
          }

          const deleteResult = await spacePlantsCollection.deleteOne({ spaceId, plantId });
          if (deleteResult.deletedCount === 0) {
            return NextResponse.json({ message: 'Plant not found in space' }, { status: 200 });
          }
          return NextResponse.json({ message: 'Plant removed from space successfully' }, { status: 200 });

        case 'deleteSpace':
          if (!spaceId) {
            return NextResponse.json({ error: 'spaceId is required' }, { status: 400 });
          }

          // Verify space exists and belongs to user (check both string and ObjectId)
          const spaceToDelete = await spacesCollection.findOne({
            _id: new ObjectId(spaceId),
            $or: [
              { userId: actualUserId },
              { userId: new ObjectId(actualUserId) }
            ]
          });
          if (!spaceToDelete) {
            return NextResponse.json({ error: 'Space not found or not authorized' }, { status: 404 });
          }

          // Delete the space and its associated plants
          await spacesCollection.deleteOne({ _id: new ObjectId(spaceId) });
          await spacePlantsCollection.deleteMany({ spaceId });
          return NextResponse.json({ message: 'Space deleted successfully' }, { status: 200 });

        default:
          return NextResponse.json({ error: 'Invalid action for POST request' }, { status: 400 });
      }
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error processing POST request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    );
  }
} 