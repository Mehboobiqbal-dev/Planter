import { NextRequest, NextResponse } from 'next/server';

// Adjust these paths to point to your actual files:

// /api/plants/[id].ts (or similar path in your app router structure)
;
import { ObjectId } from 'mongodb'; // Make sure to import ObjectId
import clientPromise from '../../../../../lib/mongodb'; // Adjust path if needed
import { Plant } from '../../../../../types/plant'; // Adjust path if needed

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // For App Router, params is an object with id property
): Promise<NextResponse> {
  const { id } = params; // Directly access id from params

  console.log(`[API /api/plants/[id]] GET request for id/slug: ${id}`);

  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.warn('[API /api/plants/[id]] Invalid or missing ID.');
    return NextResponse.json(
      { error: 'Invalid or missing ID.' },
      { status: 400 }
    );
  }

  const cleanId = id.trim();

  try {
    const client = await clientPromise;
    const db = client.db('plantdb'); // ← your actual DB name
    const collection = db.collection('plants'); // ← your actual collection name

    let plantDoc: any = null; // Use 'any' or a proper DB type for the raw doc
    const startQueryTime = Date.now();
    console.log(
      `[API /api/plants/[id]] Searching for plant with identifier: ${cleanId}`
    );

    // 1) Try exact slug match
    plantDoc = await collection.findOne({ slug: cleanId });
    if (plantDoc) {
      console.log(`[API /api/plants/[id]] Found by exact slug match.`);
    }

    // 2) If not found, try case-insensitive slug
    if (!plantDoc) {
      plantDoc = await collection.findOne({
        slug: { $regex: `^${cleanId}$`, $options: 'i' },
      });
      if (plantDoc) {
        console.log(
          `[API /api/plants/[id]] Found by case-insensitive slug match.`
        );
      }
    }
    
    // 3) If still not found, and cleanId is a valid ObjectId, try _id lookup
    // The _id in your DB is an ObjectId object, not a string.
    if (!plantDoc && ObjectId.isValid(cleanId)) {
      try {
        plantDoc = await collection.findOne({ _id: new ObjectId(cleanId) });
        if (plantDoc) {
          console.log(`[API /api/plants/[id]] Found by ObjectId match.`);
        }
      } catch (e) {
        console.error(`[API /api/plants/[id]] Error converting to ObjectId or querying by _id: ${cleanId}`, e);
      }
    }


    // 4) Finally, try matching by name (case-insensitive)
    // This is a fallback and might not be ideal if names aren't unique
    if (!plantDoc) {
      const nameQuery = cleanId.replace(/-/g, ' '); // e.g. 'aloe-vera' → 'aloe vera'
      plantDoc = await collection.findOne({
        name: { $regex: `^${nameQuery}$`, $options: 'i' },
      });
      if (plantDoc) {
        console.log(
          `[API /api/plants/[id]] Found by case-insensitive name match: ${nameQuery}`
        );
      }
    }

    console.log(
      `[API /api/plants/[id]] Total query time for plant ${cleanId}: ${
        Date.now() - startQueryTime
      }ms`
    );

    if (!plantDoc) {
      console.warn(
        `[API /api/plants/[id]] Plant not found for identifier: ${cleanId}`
      );
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    // --- THIS IS THE CRUCIAL MAPPING ---
    // Ensure that `plantDoc` actually has `description` and `invitation`
    // before you try to access them.
    console.log("[API /api/plants/[id]] RAW plantDoc from DB:", JSON.stringify(plantDoc, null, 2));


    const formatted: Plant = {
      _id: plantDoc._id?.toString() || '',
      name: plantDoc.name || 'Unknown Plant',
      category: plantDoc.category || 'Unknown', // Assuming 'category' exists directly
      image: plantDoc.image || '/images/default-plant.jpg', // Assuming 'image' (primary image URL string) exists
      latin: plantDoc.latin || undefined,
      description: plantDoc.description || '', // Directly from DB field
      invitation: plantDoc.invitation || undefined, // Directly from DB field
      fullDescription: plantDoc.fullDescription || undefined, // Directly from DB field
      images: Array.isArray(plantDoc.images) ? plantDoc.images : [], // Assuming 'images' array of objects exists
      care: // Assuming 'care' object exists
        plantDoc.care && typeof plantDoc.care === 'object'
          ? plantDoc.care
          : undefined,
      careRequirements: Array.isArray(plantDoc.careRequirements) // Assuming 'careRequirements' array exists
        ? plantDoc.careRequirements
        : [],
      careSections: Array.isArray(plantDoc.careSections) // Assuming 'careSections' array exists
        ? plantDoc.careSections
        : [],
      funFact: plantDoc.funFact || undefined,
      commonName: plantDoc.commonName || undefined,
      slug: plantDoc.slug || undefined,
      toxicity: plantDoc.toxicity ?? null, // Assuming 'toxicity' field exists
      difficulty: plantDoc.difficulty || undefined,
      humidity: plantDoc.humidity || undefined,
      detailId: plantDoc._id?.toString() || null, // Using _id as detailId
    };

    console.log(
      `[API /api/plants/[id]] Successfully fetched and formatted plant: ${formatted.name}. Description: "${formatted.description}", Invitation: "${formatted.invitation}"`
    );
    return NextResponse.json(formatted, { status: 200 });
  } catch (err: any) {
    console.error(
      `[API /api/plants/[id]] Failed to fetch plant with id/slug ${cleanId}:`,
      err
    );
    return NextResponse.json(
      {
        error: 'Failed to fetch plant',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}