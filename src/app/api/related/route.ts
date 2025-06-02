// src/app/api/plants/related/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

interface Plant {
  _id: string;
  name: string;
  category: string;
  image: string;
  latin: string;
  slug?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const excludeId = searchParams.get('excludeId');
  const limitParam = Number(searchParams.get('limit') || '4');
  const limit = isNaN(limitParam) || limitParam < 1 ? 4 : limitParam;

  if (!category || !excludeId) {
    return NextResponse.json(
      { error: 'Missing required query parameters: category and excludeId.' },
      { status: 400 }
    );
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json(
      { error: 'Server configuration error: MONGODB_URI is not defined.' },
      { status: 500 }
    );
  }

  // Create a new client (or swap this with your shared clientPromise)
  const client = new MongoClient(uri);
  try {
    // Connect once
    await client.connect();
    const db = client.db('plantdb');   // ← your DB name
    const plantsColl = db.collection('plants');

    // Convert excludeId to ObjectId once
    const excludeObjectId = new ObjectId(excludeId);

    // Build the two cursors:
    const inCategoryCursor = plantsColl
      .find(
        {
          category: category,
          _id: { $ne: excludeObjectId },
        },
        {
          projection: { name: 1, category: 1, image: 1, latin: 1, slug: 1 },
        }
      )
      .limit(limit);

    const otherCursor = plantsColl
      .find(
        {
          category: { $ne: category },
          _id: { $ne: excludeObjectId },
        },
        {
          projection: { name: 1, category: 1, image: 1, latin: 1, slug: 1 },
        }
      )
      .limit(limit);

    // Fetch both in parallel
    const [inCategoryDocs, otherDocs] = await Promise.all([
      inCategoryCursor.toArray(),
      otherCursor.toArray(),
    ]);

    // Combine and then trim to `limit`
    const combined = [...inCategoryDocs, ...otherDocs].slice(0, limit);

    // Map to plain JS with string _id
    const related: Plant[] = combined.map((doc: any) => ({
      _id: doc._id.toString(),
      name: doc.name,
      category: doc.category,
      image: doc.image || '/images/default-plant.jpg',
      latin: doc.latin || doc.name,
      slug: doc.slug,
    }));

    return NextResponse.json(related);
  } catch (e: any) {
    console.error('[API /api/plants/related] Error fetching related plants:', e);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
