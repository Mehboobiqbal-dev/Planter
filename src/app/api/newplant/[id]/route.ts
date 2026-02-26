import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '../../../../../lib/cloudinary';
import { multerMiddleware } from '../../../../../middleware/multerMiddleware';

// MongoDB connection setup
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let isConnected = false;

// Interfaces (unchanged)
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
  latin?: string;
  category?: string;
  images?: any[];
  care?: any;
  careRequirements?: any[];
  careSections?: any[];
  fullDescription?: string;
  invitation?: string;
  funFact?: string;
  slug?: string;
  toxicity?: string | null;
  difficulty?: string;
  humidity?: string;
  originalId?: number;
  originalCreatedAt?: Date;
  originalUpdatedAt?: Date;
  originalPublishedAt?: Date;
  linkedPlantId?: string | null;
}

// Connect to MongoDB collections (unchanged)
async function connectToPlantsCollection() {
  try {
    if (!isConnected) {
      await client.connect();
      isConnected = true;
    }
    const database = client.db(process.env.MONGODB_DB_NAME || 'plantdb');
    return database.collection('plants');
  } catch (error) {
    console.error('Failed to connect to plants collection:', error);
    throw new Error('Database connection failed');
  }
}

async function connectToNewPlantsCollection() {
  try {
    if (!isConnected) {
      await client.connect();
      isConnected = true;
    }
    const database = client.db(process.env.MONGODB_DB_NAME || 'plantdb');
    return database.collection('newplants');
  } catch (error) {
    console.error('Failed to connect to newplants collection:', error);
    throw new Error('Database connection failed');
  }
}

async function connectToSpacesCollection() {
  try {
    if (!isConnected) {
      await client.connect();
      isConnected = true;
    }
    const database = client.db(process.env.MONGODB_DB_NAME || 'plantdb');
    return database.collection('spaces');
  } catch (error) {
    console.error('Failed to connect to spaces collection:', error);
    throw new Error('Database connection failed');
  }
}

async function connectToSpacePlantsCollection() {
  try {
    if (!isConnected) {
      await client.connect();
      isConnected = true;
    }
    const database = client.db(process.env.MONGODB_DB_NAME || 'plantdb');
    return database.collection('spacePlants');
  } catch (error) {
    console.error('Failed to connect to spacePlants collection:', error);
    throw new Error('Database connection failed');
  }
}

async function connectToUsersCollection() {
  try {
    if (!isConnected) {
      await client.connect();
      isConnected = true;
    }
    const database = client.db(process.env.MONGODB_DB_NAME || 'plantdb');
    return database.collection('users');
  } catch (error) {
    console.error('Failed to connect to users collection:', error);
    throw new Error('Database connection failed');
  }
}

// Normalize string for case-insensitive search (unchanged)
function normalizeString(str: string | undefined): string {
  return str ? str.toLowerCase().replace(/-/g, ' ').trim() : '';
}

// GET: Retrieve plant data by plantId from dynamic route parameter
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const plantId = params.id;

    // Validate plantId
    if (!plantId) {
      return NextResponse.json({ error: 'plantId is required' }, { status: 400 });
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(plantId);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid plantId format' }, { status: 400 });
    }

    // Connect to plants collection
    const plantsCollection = await connectToPlantsCollection();

    // Find plant by ID
    const plant = await plantsCollection.findOne({ _id: objectId });

    if (!plant) {
      // Optionally check newplants collection if not found in plants
      const newPlantsCollection = await connectToNewPlantsCollection();
      const newPlant = await newPlantsCollection.findOne({ _id: objectId });
      if (!newPlant) {
        return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
      }
      // Convert ObjectId to string for response
      return NextResponse.json(
        {
          id: newPlant._id.toString(),
          ...newPlant,
          _id: newPlant._id.toString(),
        },
        { status: 200 }
      );
    }

    // Convert ObjectId to string for response
    return NextResponse.json(
      {
        id: plant._id.toString(),
        ...plant,
        _id: plant._id.toString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/newplant/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add a new plant analysis
export async function POST(request: NextRequest) {
  try {
    // Parse form data (image and fields)
    const { fields, files } = await multerMiddleware(request);
    console.log('Received Fields:', fields, 'Files:', files);

    // Validate required fields
    if (!fields.name && (!fields.commonNames || fields.commonNames === '[]' || fields.commonNames === '')) {
      return NextResponse.json({ error: 'Name or commonNames required' }, { status: 400 });
    }
    if (!fields.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    if (!fields.spaceId) {
      return NextResponse.json({ error: 'spaceId is required' }, { status: 400 });
    }

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
        // Validate similarImages structure
        if (!Array.isArray(body.similarImages) || body.similarImages.some(img => !img.url)) {
          return NextResponse.json({ error: 'Invalid similarImages format' }, { status: 400 });
        }
      }
    } catch (error) {
      console.error('Invalid JSON in similarImages:', error);
      return NextResponse.json({ error: 'Invalid JSON in similarImages' }, { status: 400 });
    }

    try {
      if (fields.diseases && fields.diseases !== '[]' && fields.diseases !== '') {
        body.diseases = JSON.parse(Array.isArray(fields.diseases) ? fields.diseases[0] : fields.diseases);
        // Validate diseases structure
        if (!Array.isArray(body.diseases) || body.diseases.some(d => !d.name)) {
          return NextResponse.json({ error: 'Invalid diseases format' }, { status: 400 });
        }
      }
    } catch (error) {
      console.error('Invalid JSON in diseases:', error);
      return NextResponse.json({ error: 'Invalid JSON in diseases' }, { status: 400 });
    }

    try {
      if (fields.commonNames && fields.commonNames !== '[]' && fields.commonNames !== '') {
        body.commonNames = JSON.parse(
          Array.isArray(fields.commonNames) ? fields.commonNames[0] : fields.commonNames
        );
        // Validate commonNames structure
        if (!Array.isArray(body.commonNames) || body.commonNames.some(name => typeof name !== 'string')) {
          return NextResponse.json({ error: 'Invalid commonNames format' }, { status: 400 });
        }
      }
    } catch (error) {
      console.error('Invalid JSON in commonNames:', error);
      return NextResponse.json({ error: 'Invalid JSON in commonNames' }, { status: 400 });
    }

    // Validate commonNames for unrelated entries
    if (body.name === 'prickly-pear-cactus' && body.commonNames?.includes('Solanum lycopersicum')) {
      console.warn('Warning: commonNames includes "Solanum lycopersicum", which is unrelated to prickly-pear-cactus');
    }

    // Handle userId and spaceId
    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
    const spaceId = Array.isArray(fields.spaceId) ? fields.spaceId[0] : fields.spaceId;

    // Validate userId
    const usersCollection = await connectToUsersCollection();
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

    // Validate spaceId
    try {
      new ObjectId(spaceId);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid spaceId format' }, { status: 400 });
    }
    const spacesCollection = await connectToSpacesCollection();
    const space = await spacesCollection.findOne({
      _id: new ObjectId(spaceId),
      $or: [
        { userId: actualUserId },
        { userId: new ObjectId(actualUserId) },
      ],
    });
    if (!space) {
      return NextResponse.json({ error: 'Space not found or user not authorized' }, { status: 404 });
    }

    // Handle main image upload
    let imageUrl: string | undefined;
    const mainImageFile = files.find((file) => file.fieldname === 'image');
    if (mainImageFile && mainImageFile.buffer) {
      if (!mainImageFile.mimetype.includes('image')) {
        return NextResponse.json({ error: 'Only images are allowed for main image' }, { status: 400 });
      }
      try {
        imageUrl = await uploadToCloudinary(mainImageFile.buffer, 'plants');
        body.image = imageUrl;
      } catch (error) {
        console.error('Failed to upload main image to Cloudinary:', error);
        return NextResponse.json({ error: 'Failed to upload main image' }, { status: 500 });
      }
    }

    // Handle similar images from JSON or additional files
    const similarImagesFromJson = body.similarImages || [];
    const similarImageFiles = files.filter((file) => file.fieldname.startsWith('similarImage'));
    const similarImages: SimilarImage[] = [...similarImagesFromJson];

    // Upload similar image files to Cloudinary
    for (const [index, file] of similarImageFiles.entries()) {
      if (file.buffer && file.mimetype.includes('image')) {
        try {
          const url = await uploadToCloudinary(file.buffer, 'plants/similar');
          similarImages.push({
            id: `${Date.now()}-${index}`,
            url,
            similarity: 0.9,
          });
        } catch (error) {
          console.error(`Failed to upload similar image ${index}:`, error);
          return NextResponse.json({ error: `Failed to upload similar image ${index}` }, { status: 500 });
        }
      }
    }
    body.similarImages = similarImages;

    const plantsCollection = await connectToPlantsCollection();
    const newPlantsCollection = await connectToNewPlantsCollection();
    const spacePlantsCollection = await connectToSpacePlantsCollection();

    // Normalize search terms
    const normalizedName = normalizeString(body.name);
    const normalizedCommonNames = body.commonNames?.map(name => normalizeString(name)) || [];

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
    };

    // Check if plant exists in plants collection by name or common names
    const existingPlant = await plantsCollection.findOne({
      $or: [
        { name: { $regex: `^${normalizedName}$`, $options: 'i' } },
        { commonNames: { $in: normalizedCommonNames.map(name => new RegExp(`^${name}$`, 'i')) } },
      ],
    });
    console.log('Existing plant found:', existingPlant);

    // Insert into newplants collection
    let result;
    try {
      result = await newPlantsCollection.insertOne(plantDocument);
      plantDocument._id = result.insertedId;
    } catch (error) {
      console.error('Failed to insert into newplants collection:', error);
      return NextResponse.json({ error: 'Failed to save to newplants collection' }, { status: 500 });
    }

    // Merge data with existing plant or insert new one
    let plantId = plantDocument._id.toString();
    if (existingPlant) {
      // Merge existing plant data with new data
      const updatedPlant: PlantData = {
        ...existingPlant,
        name: plantDocument.name,
        probability: plantDocument.probability ?? existingPlant.probability ?? 0,
        similarImages: [
          ...(existingPlant.similarImages || []),
          ...(plantDocument.similarImages || []),
        ],
        diseases: [
          ...(existingPlant.diseases || []),
          ...(plantDocument.diseases || []),
        ],
        isHealthy: plantDocument.isHealthy ?? existingPlant.isHealthy ?? true,
        commonNames: [
          ...new Set([
            ...(existingPlant.commonNames || []),
            ...(plantDocument.commonNames || []),
          ]),
        ],
        description: plantDocument.description ?? existingPlant.description ?? '',
        image: plantDocument.image ?? existingPlant.image ?? '',
        createdAt: existingPlant.createdAt,
        latin: existingPlant.latin,
        category: existingPlant.category,
        images: existingPlant.images,
        care: existingPlant.care,
        careRequirements: existingPlant.careRequirements,
        careSections: existingPlant.careSections,
        fullDescription: existingPlant.fullDescription,
        invitation: existingPlant.invitation,
        funFact: existingPlant.funFact,
        slug: existingPlant.slug,
        toxicity: existingPlant.toxicity,
        difficulty: existingPlant.difficulty,
        humidity: existingPlant.humidity,
        originalId: existingPlant.originalId,
        originalCreatedAt: existingPlant.originalCreatedAt,
        originalUpdatedAt: existingPlant.originalUpdatedAt,
        originalPublishedAt: existingPlant.originalPublishedAt,
        linkedPlantId: existingPlant.linkedPlantId,
      };

      try {
        await plantsCollection.updateOne(
          { _id: existingPlant._id },
          { $set: updatedPlant }
        );
        plantId = existingPlant._id.toString();
        plantDocument._id = existingPlant._id;
        Object.assign(plantDocument, updatedPlant);
      } catch (error) {
        console.error('Failed to update plants collection:', error);
        return NextResponse.json({ error: 'Failed to update plants collection' }, { status: 500 });
      }
    } else {
      // Insert new plant into plants collection
      try {
        const plantsResult = await plantsCollection.insertOne(plantDocument);
        plantId = plantsResult.insertedId.toString();
        plantDocument._id = plantsResult.insertedId;
      } catch (error) {
        console.error('Failed to insert into plants collection:', error);
        return NextResponse.json({ error: 'Failed to save to plants collection' }, { status: 500 });
      }
    }

    // Associate plant with space
    try {
      // Check if plant is already in space
      const existingSpacePlant = await spacePlantsCollection.findOne({
        spaceId,
        plantId,
      });
      if (!existingSpacePlant) {
        await spacePlantsCollection.insertOne({
          spaceId,
          plantId,
          userId: new ObjectId(actualUserId),
          addedAt: new Date(),
        });
        console.log(`Plant ${plantId} added to space ${spaceId}`);
      } else {
        console.log(`Plant ${plantId} already exists in space ${spaceId}`);
      }
    } catch (error) {
      console.error('Failed to associate plant with space:', error);
      return NextResponse.json({ error: 'Failed to associate plant with space' }, { status: 500 });
    }

    // Convert ObjectId to string for response
    return NextResponse.json(
      {
        id: plantDocument._id?.toString(),
        ...plantDocument,
        _id: plantDocument._id?.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/newplant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Ensure MongoDB client closes on process termination (unchanged)
process.on('SIGINT', async () => {
  if (isConnected) {
    await client.close();
    isConnected = false;
  }
  process.exit(0);
});