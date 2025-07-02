import { MongoClient, ObjectId, WithId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

// MongoDB connection setup
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Interface for disease details
interface DiseaseDetails {
  localName?: string;
  description?: string;
  treatment?: {
    biological?: string[];
    chemical?: string[];
    prevention?: string[];
  };
}

// Interface for disease
interface Disease {
  name: string;
  probability: number;
  diseaseDetails: DiseaseDetails;
}

// Interface for similar images
interface SimilarImage {
  id: string;
  url: string;
  urlSmall?: string;
  similarity: number;
  licenseName?: string;
  licenseUrl?: string;
  citation?: string;
}

// Interface for plant data (used for MongoDB document)
interface PlantData {
  _id?: ObjectId;
  name: string;
  probability: number;
  similarImages: SimilarImage[];
  diseases: Disease[];
  isHealthy: boolean;
  commonNames: string[];
  description?: string;
  image: string;
  createdAt: string;
  linkedPlantId?: string | null;
}

// Interface for plant data response (used for API response)
interface PlantDataResponse {
  _id: string;
  name: string;
  probability: number;
  similarImages: SimilarImage[];
  diseases: Disease[];
  isHealthy: boolean;
  commonNames: string[];
  description?: string;
  image: string;
  createdAt: string;
  linkedPlantId?: string | null;
}

// Connect to MongoDB newplant collection
async function connectToNewPlantCollection() {
  try {
    await client.connect();
    const database = client.db(process.env.MONGODB_DB_NAME || 'plantdb');
    return database.collection<PlantData>('newplant');
  } catch (error) {
    console.error('Failed to connect to newplant collection:', error);
    throw error;
  }
}

// GET: Retrieve a specific plant analysis by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Validate ID format
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid or missing plant ID' }, { status: 400 });
    }

    const newPlantCollection = await connectToNewPlantCollection();
    const plant = await newPlantCollection.findOne({ _id: new ObjectId(id) }) as WithId<PlantData> | null;

    if (!plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    // Convert ObjectId to string for JSON serialization
    const formattedPlant: PlantDataResponse = {
      _id: plant._id.toString(),
      name: plant.name,
      probability: plant.probability,
      similarImages: plant.similarImages,
      diseases: plant.diseases,
      isHealthy: plant.isHealthy,
      commonNames: plant.commonNames,
      description: plant.description,
      image: plant.image,
      createdAt: plant.createdAt,
      linkedPlantId: plant.linkedPlantId ? plant.linkedPlantId.toString() : null,
    };

    return NextResponse.json(formattedPlant, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/newplant/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Ensure MongoDB client closes on process termination
process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});