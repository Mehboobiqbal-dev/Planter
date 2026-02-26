import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '../../../../lib/cloudinary';
import { multerMiddleware } from '../../../../middleware/multerMiddleware';

// MongoDB connection setup
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let isConnected = false;

// Interfaces (all fields optional)
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

interface PlantData {
  _id?: ObjectId;
  name?: string;
  probability?: number;
  similarImages?: string[];
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

// Connect to MongoDB collections
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

// Normalize string for case-insensitive search
function normalizeString(str: string | undefined): string {
  return str ? str.toLowerCase().replace(/-/g, ' ').trim() : '';
}

// POST: Add a new plant analysis
export async function POST(request: NextRequest) {
  try {
    // Parse form data (image and fields)
    const { fields, files } = await multerMiddleware(request);
    console.log('Received Fields:', fields, 'Files:', files);

    // Validate required fields
    if (!fields.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
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

    // Parse JSON fields safely for similarImages (expecting an array of URLs)
    try {
      if (fields.similarImages && fields.similarImages !== '[]' && fields.similarImages !== '') {
        const parsedImages = JSON.parse(
          Array.isArray(fields.similarImages) ? fields.similarImages[0] : fields.similarImages
        );
        // Validate similarImages structure (array of strings)
        if (!Array.isArray(parsedImages) || parsedImages.some(img => typeof img !== 'string')) {
          return NextResponse.json({ error: 'Invalid similarImages format, expected array of URLs' }, { status: 400 });
        }
        body.similarImages = parsedImages;
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

    // Validate commonNames for unrelated entries (optional warning)
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

    // Handle similar image files from uploads
    const similarImageFiles = files.filter((file) => file.fieldname.startsWith('similarImage'));
    const similarImages: string[] = body.similarImages || [];

    // Upload similar image files to Cloudinary
    for (const [index, file] of similarImageFiles.entries()) {
      if (file.buffer && file.mimetype.includes('image')) {
        try {
          const url = await uploadToCloudinary(file.buffer, 'plants/similar');
          similarImages.push(url);
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

    // **MODIFIED CODE STARTS HERE**
    // Normalize the plant name for searching
    const normalizedPlantName = normalizeString(body.name);

    // Check if a plant with the same name or Latin name already exists
    const existingPlant = await plantsCollection.findOne({
      $or: [
        { name: new RegExp(normalizedPlantName, 'i') }, // Case-insensitive search for common name
        { latin: new RegExp(normalizedPlantName, 'i') } // Case-insensitive search for Latin name
      ]
    });

    let plantId: string;
    let plantDocument: PlantData;

    if (existingPlant) {
      console.log(`Found existing plant with ID: ${existingPlant._id}`);
      plantId = existingPlant._id.toString();
      plantDocument = existingPlant as PlantData;
    } else {
       // Prepare plant document with defaults for optional fields
      plantDocument = {
        name: body.name ?? '',
        probability: body.probability ?? 0,
        similarImages: body.similarImages ?? [],
        diseases: body.diseases ?? [],
        isHealthy: body.isHealthy ?? true,
        commonNames: body.commonNames ?? [],
        description: body.description ?? '',
        image: body.image ?? '',
        createdAt: body.createdAt ?? new Date().toISOString(),
        latin: body.latin ?? '' // Assuming latin name might be passed in the body
      };

      // Insert into newplants collection
      try {
        const result = await newPlantsCollection.insertOne(plantDocument);
        plantDocument._id = result.insertedId;
      } catch (error) {
        console.error('Failed to insert into newplants collection:', error);
        return NextResponse.json({ error: 'Failed to save to newplants collection' }, { status: 500 });
      }

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
    // **MODIFIED CODE ENDS HERE**


    // Associate plant with space
    try {
      // Check if plant is already in space
      const existingSpacePlant = await spacePlantsCollection.findOne({
        spaceId: new ObjectId(spaceId),
        plantId: new ObjectId(plantId),
      });
      if (!existingSpacePlant) {
        await spacePlantsCollection.insertOne({
          spaceId: new ObjectId(spaceId),
          plantId: new ObjectId(plantId),
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
    console.error('Error in POST /api/upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Ensure MongoDB client closes on process termination
process.on('SIGINT', async () => {
  if (isConnected) {
    await client.close();
    isConnected = false;
  }
  process.exit(0);
});