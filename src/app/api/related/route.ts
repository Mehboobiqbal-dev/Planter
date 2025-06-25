// src/app/api/plants/related/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId, WithId } from 'mongodb';

// Interface for the data returned by the API
interface Plant {
  _id: string;
  name: string;
  category: string;
  image: string;
  latin: string;
  slug?: string;
}

// --- START: FIX 1 ---
// Interface representing the document structure in your MongoDB collection.
// This tells TypeScript that _id can be an ObjectId, a number, or a string.
interface PlantDocument {
  _id: ObjectId | number | string;
  name: string;
  category: string;
  image?: string;
  latin?: string;
  slug?: string;
}
// --- END: FIX 1 ---


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

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('plantdb');
    
    // --- START: FIX 2 ---
    // Get a typed collection. Now TypeScript knows the shape of your documents.
    const plantsColl = db.collection<PlantDocument>('plants');
    // --- END: FIX 2 ---

    let excludeQueryValue: ObjectId | number | string;
    if (ObjectId.isValid(excludeId)) {
      excludeQueryValue = new ObjectId(excludeId);
    } else {
      const numericId = parseInt(excludeId, 10);
      excludeQueryValue = !isNaN(numericId) ? numericId : excludeId;
    }

    // Now, the .find() calls are type-safe because TypeScript knows that
    // the `_id` in a PlantDocument can match the type of `excludeQueryValue`.
    const inCategoryCursor = plantsColl
      .find(
        {
          category: category,
          _id: { $ne: excludeQueryValue },
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
          _id: { $ne: excludeQueryValue },
        },
        {
          projection: { name: 1, category: 1, image: 1, latin: 1, slug: 1 },
        }
      )
      .limit(limit);

    const [inCategoryDocs, otherDocs] = await Promise.all([
      inCategoryCursor.toArray(),
      otherCursor.toArray(),
    ]);

    const combined = [...inCategoryDocs, ...otherDocs].slice(0, limit);

    const related: Plant[] = combined.map((doc) => ({
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