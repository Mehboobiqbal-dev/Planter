// src/app/api/plant-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
// ↓↓↓ IMPORT THE SHARED CLIENT PROMISE ↓↓↓
import clientPromise from '../../../../lib/mongodb'; // Adjust path if needed
import { ObjectId } from 'mongodb'; // For typing if you use it for raw docs

// Interfaces remain the same
interface Category {
  _id: string;
  name: string;
  slug: string;
  headerImage: string;
  title: string;
  description: string;
  mainDescription: string;
  expandedDescription: string;
}

// Optional: More accurate type for MongoDB category documents
interface CategoryDocument {
  _id: ObjectId;
  name: string;
  slug: string;
  headerImage: string;
  title: string;
  description: string;
  mainDescription: string;
  expandedDescription: string;
}

interface Plant {
  _id: string;
  name: string;
  category: string; // This should ideally be a category slug or ID for better relations
  image: string;
  latin: string;
  description?: string;
  slug?: string;
}

// Optional: More accurate type for MongoDB plant documents
interface PlantDocument {
  _id: ObjectId;
  name: string;
  category: string;
  image: string;
  latin: string;
  description?: string;
  slug?: string;
}

interface ApiPlantDataResponse {
  plants: Plant[];
  categories: Category[];
  plantCounts: { [key: string]: number };
  selectedCategory: Category;
}


export async function GET(request: NextRequest) {
  console.log('[API /api/plant-data] GET request received.');

  const { searchParams } = new URL(request.url);
  const requestedCategorySlug = searchParams.get('categorySlug') || 'all-plants';
  console.log(`[API /api/plant-data] Requested categorySlug: ${requestedCategorySlug}`);

  // MONGODB_URI check is handled by lib/mongodb.ts at startup
  // No need for:
  // const uri = process.env.MONGODB_URI;
  // if (!uri) { ... }

  try {
    // ↓↓↓ USE THE SHARED CLIENT PROMISE ↓↓↓
    console.time('[API /api/plant-data] ClientAcquired');
    const client = await clientPromise;
    console.timeEnd('[API /api/plant-data] ClientAcquired');

    // ↓↓↓ REMOVE client.connect() - it's handled by clientPromise ↓↓↓
    // console.time('[API /api/plant-data] DBConnect');
    // await client.connect();
    // console.timeEnd('[API /api/plant-data] DBConnect');

    const database = client.db(process.env.MONGODB_DB_NAME || 'plantdb');

    // ─────────────── Fetch categories ───────────────
    console.time('[API /api/plant-data] FetchCategories');
    const categoryCollection = database.collection<CategoryDocument>('categories');
    const categoriesFromDbRaw = await categoryCollection.find({}).toArray();
    const dbCategories: Category[] = categoriesFromDbRaw.map((doc) => ({
      _id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      headerImage: doc.headerImage,
      title: doc.title,
      description: doc.description,
      mainDescription: doc.mainDescription,
      expandedDescription: doc.expandedDescription,
    }));
    console.timeEnd('[API /api/plant-data] FetchCategories');

    const allPlantsCategoryDefault: Category = {
      _id: 'api-all-plants-default-id', // Consider if this ID needs to be stable or different
      name: 'All Plants',
      slug: 'all-plants',
      headerImage: 'https://myplantin.com/images/all-plants-header.jpg',
      title: 'All Plants Collection',
      description: 'Browse our entire collection of beautiful plants.',
      mainDescription: 'A comprehensive selection of plants from various categories.',
      expandedDescription: 'Find the perfect plant for any spot in your home or garden.',
    };

    let finalCategories = [...dbCategories];
    let allPlantsCategoryInList = finalCategories.find(c => c.slug === 'all-plants');

    if (!allPlantsCategoryInList) {
      finalCategories.unshift(allPlantsCategoryDefault);
      allPlantsCategoryInList = allPlantsCategoryDefault;
    } else {
      // Ensure the "All Plants" from DB (if exists) is used for consistency
      allPlantsCategoryInList = finalCategories.find(c => c.slug === 'all-plants')!;
    }


    let resolvedSelectedCategory: Category;
    if (requestedCategorySlug === 'all-plants') {
      resolvedSelectedCategory = allPlantsCategoryInList;
    } else {
      resolvedSelectedCategory =
        finalCategories.find(cat => cat.slug === requestedCategorySlug) || allPlantsCategoryInList;
    }
    console.log(`[API /api/plant-data] Resolved selectedCategory: ${resolvedSelectedCategory.name}`);

    // ─────────────── Fetch plants for that category ───────────────
    const plantCollection = database.collection<PlantDocument>('plants');
    let plantsQuery = {};
    if (resolvedSelectedCategory.slug !== 'all-plants') {
      // Ensure 'category' field (if it's storing category NAME) is indexed.
      // Better: store category SLUG or _ID in plants.category for robust linking.
      plantsQuery = { category: resolvedSelectedCategory.name };
    }

    console.time('[API /api/plant-data] FetchPlantsForCategory');
    const plantsForCategoryDb = await plantCollection
      .find(plantsQuery, {
        projection: { _id: 1, name: 1, category: 1, image: 1, latin: 1, description: 1, slug: 1 },
      })
      .limit(200) // Good practice
      .toArray();
    console.timeEnd('[API /api/plant-data] FetchPlantsForCategory');

    const plantsForCategory: Plant[] = plantsForCategoryDb.map((doc) => ({
      _id: doc._id.toString(),
      name: doc.name,
      category: doc.category,
      image: doc.image,
      latin: doc.latin,
      description: doc.description || '',
      slug: doc.slug,
    }));
    console.log(`[API /api/plant-data] Fetched ${plantsForCategory.length} plants for selected category.`);

    // ─────────────── Calculate plant counts via aggregation ───────────────
    console.time('[API /api/plant-data] CalculatePlantCounts');
    const countsCursor = plantCollection.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }, // Make sure 'category' field is indexed if it's frequently grouped on
    ]);
    const countsArray = await countsCursor.toArray();

    const countsMap: Record<string, number> = {};
    let totalCount = 0;
    countsArray.forEach((item: any) => { // Type item more strictly if possible
      if (item._id) { // Guard against null/undefined categories if they can exist
        countsMap[item._id] = item.count;
        totalCount += item.count;
      }
    });

    const plantCounts: { [key: string]: number } = {};
    finalCategories.forEach((cat) => {
      if (cat.slug === 'all-plants') {
        plantCounts[cat.name] = totalCount;
      } else {
        // Assumes cat.name matches the value in plant.category field
        plantCounts[cat.name] = countsMap[cat.name] || 0;
      }
    });
    console.timeEnd('[API /api/plant-data] CalculatePlantCounts');
    console.log('[API /api/plant-data] Plant counts calculated.');

    const responseData: ApiPlantDataResponse = {
      plants: plantsForCategory,
      categories: finalCategories,
      plantCounts,
      selectedCategory: resolvedSelectedCategory,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[API /api/plant-data] Critical error in API route:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown internal server error occurred.';
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  } finally {
    // ↓↓↓ REMOVE client.close() - connection is managed globally ↓↓↓
    // console.time('[API /api/plant-data] DBClose');
    // if (client) { // client will always be defined if await clientPromise succeeds
    //   await client.close();
    // }
    // console.timeEnd('[API /api/plant-data] DBClose');
    console.log('[API /api/plant-data] Request finished.');
  }
}