// src/app/api/plant-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
// import { MongoClient } from 'mongodb'; // No longer directly import MongoClient here
import clientPromise from '../../../../lib/mongodb'; // Adjust path to your lib/mongodb.ts

// ... other interfaces ...

export async function GET(request: NextRequest) {
  // ... (searchParams, requestedCategorySlug) ...

  // const uri = process.env.MONGODB_URI; // MONGODB_URI check is now in lib/mongodb.ts
  // if (!uri) { ... }

  let client: import('mongodb').MongoClient | undefined; // For the finally block

  try {
    console.time('[API /api/plant-data] GetClientFromPool');
    client = await clientPromise; // Get the shared client instance
    console.timeEnd('[API /api/plant-data] GetClientFromPool');

    const database = client.db('plantdb');
    // ... rest of your logic ...
  } catch (error) {
    // ... error handling ...
  } finally {
    // IMPORTANT: When using a shared clientPromise, you DO NOT close the client here.
    // The connection is managed globally.
    // if (client) {
    //   await client.close(); // DO NOT DO THIS WITH clientPromise
    // }
    console.log('[API /api/plant-data] Request finished. Connection remains open in pool.');
  }
}