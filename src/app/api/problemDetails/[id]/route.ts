// app/api/problems/[id]/route.ts (or your existing path)
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../../lib/mongodb'; // Adjust path

interface ProblemDetail {
  _id: string;
  scientificName: string;
  fullDescription: string;
  SignOfDamage: string;
  images: string[];
}

interface ProblemDocument {
  _id: ObjectId;
  scientificName: string;
  fullDescription: string;
  SignOfDamage: string;
  images: string[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const overallStartTime = Date.now();
  console.log(`[${new Date().toISOString()}] API_REQUEST_START - ID: ${params.id}`);

  const { id } = params;

  if (!ObjectId.isValid(id)) {
    console.error(`[${new Date().toISOString()}] API_INVALID_ID - ID: ${id}. Total time: ${Date.now() - overallStartTime}ms`);
    return NextResponse.json(
      { error: 'Invalid problem ID' },
      { status: 400 }
    );
  }

  try {
    const clientAcquireStartTime = Date.now();
    const client = await clientPromise;
    console.log(`[${new Date().toISOString()}] API_CLIENT_ACQUIRED - Time for clientPromise: ${Date.now() - clientAcquireStartTime}ms`);

    const db = client.db('plantdb'); // Consider process.env.MONGODB_DB_NAME
    const collection = db.collection<ProblemDocument>('problemDetails');

    console.log(`[${new Date().toISOString()}] API_DB_QUERY_START - Querying for _id: ${id}`);
    const queryStartTime = Date.now();
    const detail = await collection.findOne({ _id: new ObjectId(id) });
    const queryDuration = Date.now() - queryStartTime;
    console.log(`[${new Date().toISOString()}] API_DB_QUERY_END - Time for findOne: ${queryDuration}ms. Found: ${!!detail}`);

    if (!detail) {
      console.log(`[${new Date().toISOString()}] API_NOT_FOUND - ID: ${id}. Total time: ${Date.now() - overallStartTime}ms`);
      return NextResponse.json(
        { error: 'Problem detail not found' },
        { status: 404 }
      );
    }

    const formatStartTime = Date.now();
    const formatted: ProblemDetail = {
      _id: detail._id.toString(),
      scientificName: detail.scientificName,
      fullDescription: detail.fullDescription,
      SignOfDamage: detail.SignOfDamage,
      images: detail.images,
    };
    console.log(`[${new Date().toISOString()}] API_FORMAT_END - Time for formatting: ${Date.now() - formatStartTime}ms`);

    console.log(`[${new Date().toISOString()}] API_REQUEST_SUCCESS - Total time: ${Date.now() - overallStartTime}ms`);
    return NextResponse.json(formatted);

  } catch (err: any) {
    console.error(`[${new Date().toISOString()}] API_ERROR - ID: ${id}:`, err);
    console.error(`[${new Date().toISOString()}] API_ERROR_DETAIL - Total time before error: ${Date.now() - overallStartTime}ms`);
    const errorMessage = process.env.NODE_ENV === 'development' ? err.message : 'Failed to fetch problem detail';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}