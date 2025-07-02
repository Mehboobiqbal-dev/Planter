import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '../../../../lib/cloudinary';
import { multerMiddleware } from '../../../../middleware/multerMiddleware';

// MongoDB connection setup
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Interfaces (all fields optional, including similarImages)
interface DiseaseDetails {
  localName?: string;
  description?: string;
  treatment?: {
    biological?: string[];
    chemical?: string[];
    prevention?: string[];
  };
}

interface Disease {
  name?: string;
  probability?: number;
  diseaseDetails?: DiseaseDetails;
}

interface SimilarImage {
  id?: string;
  url?: string;
  urlSmall?: string;
  similarity?: number;
  licenseName?: string;
  licenseUrl?: string;
  citation?: string;
}

interface PlantData {
  _id?: ObjectId;
  name?: string;
  probability?: number;
  similarImages?: SimilarImage[];
  diseases?: Disease[];
  isHealthy?: boolean;
  commonNames?: string[];
  description?: string;
  image?: string;
  createdAt?: string;
  linkedPlantId?: string | null;
}

// Connect to MongoDB plants collection
async function connectToPlantsCollection() {
  try {
    await client.connect();
    const database = client.db(process.env.MONGODB_DB_NAME || 'plantdb');
    return database.collection('plants');
  } catch (error) {
    console.error('Failed to connect to plants collection:', error);
    throw error;
  }
}

// POST: Add a new plant analysis
export async function POST(request: NextRequest) {
  try {
    // Parse form data (image and fields)
    const { fields, files } = await multerMiddleware(request);
    console.log('Fields:', fields, 'Files:', files); // Debug log

    // Extract and normalize fields
    const body: Partial<PlantData> = {
      name: Array.isArray(fields.name) ? fields.name[0] : fields.name,
      probability: fields.probability
        ? parseFloat(Array.isArray(fields.probability) ? fields.probability[0] : fields.probability)
        : undefined,
      similarImages: [],
      diseases: [],
      isHealthy: fields.isHealthy
        ? (Array.isArray(fields.isHealthy) ? fields.isHealthy[0] : fields.isHealthy) === 'true'
        : undefined,
      commonNames: [],
      description: Array.isArray(fields.description) ? fields.description[0] : fields.description,
      image: undefined,
      createdAt: new Date().toISOString(),
    };

    // Parse JSON fields safely
    try {
      if (fields.similarImages && fields.similarImages !== '[]' && fields.similarImages !== '') {
        body.similarImages = JSON.parse(
          Array.isArray(fields.similarImages) ? fields.similarImages[0] : fields.similarImages
        );
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON in similarImages' }, { status: 400 });
    }

    try {
      if (fields.diseases && fields.diseases !== '[]' && fields.diseases !== '') {
        body.diseases = JSON.parse(Array.isArray(fields.diseases) ? fields.diseases[0] : fields.diseases);
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON in diseases' }, { status: 400 });
    }

    try {
      if (fields.commonNames && fields.commonNames !== '[]' && fields.commonNames !== '') {
        body.commonNames = JSON.parse(
          Array.isArray(fields.commonNames) ? fields.commonNames[0] : fields.commonNames
        );
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON in commonNames' }, { status: 400 });
    }

    // Handle main image upload
    let imageUrl: string | undefined;
    const mainImageFile = files.find((file) => file.fieldname === 'image');
    if (mainImageFile && mainImageFile.buffer) {
      if (!mainImageFile.mimetype.includes('image')) {
        return NextResponse.json({ error: 'Only images are allowed for main image' }, { status: 400 });
      }
      imageUrl = await uploadToCloudinary(mainImageFile.buffer, 'plants');
      body.image = imageUrl;
    }

    // Handle similar images from JSON or additional files
    const similarImagesFromJson = body.similarImages || [];
    const similarImageFiles = files.filter((file) => file.fieldname.startsWith('similarImage'));
    const similarImages: SimilarImage[] = [...similarImagesFromJson];

    // Upload similar image files to Cloudinary
    for (const [index, file] of similarImageFiles.entries()) {
      if (file.buffer && file.mimetype.includes('image')) {
        const url = await uploadToCloudinary(file.buffer, 'plants/similar');
        similarImages.push({
          id: `${Date.now()}-${index}`, // Unique ID based on timestamp and index
          url: url,
          similarity: 0.9, // Default similarity (adjust as needed)
        });
      }
    }
    body.similarImages = similarImages;

    const plantsCollection = await connectToPlantsCollection();

    // Prepare plant document with defaults for optional fields
    const plantDocument: PlantData = {
      name: body.name ?? '',
      probability: body.probability ?? 0,
      similarImages: body.similarImages ?? [],
      diseases: body.diseases ?? [],
      isHealthy: body.isHealthy ?? true,
      commonNames: body.commonNames ?? [],
      description: body.description ?? '',
      image: body.image ?? '',
      createdAt: body.createdAt ?? new Date().toISOString(),
      linkedPlantId: null,
    };

    // Check if plant exists by name (scientific or common) to avoid duplicates
    const existingPlant = await plantsCollection.findOne({
      $or: [
        { name: body.name || '' },
        { commonNames: { $in: body.commonNames?.length ? body.commonNames : [] } },
      ],
    });

    if (existingPlant) {
      plantDocument.linkedPlantId = existingPlant._id.toString();
    } else {
      // Insert new plant
      const result = await plantsCollection.insertOne(plantDocument);
      plantDocument._id = result.insertedId;
      plantDocument.linkedPlantId = result.insertedId.toString();
    }

    // Convert ObjectId to string for response
    return NextResponse.json(
      {
        id: plantDocument._id?.toString() || plantDocument.linkedPlantId,
        ...plantDocument,
        _id: plantDocument._id?.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Ensure MongoDB client closes on process termination
process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});