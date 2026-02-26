import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Interfaces
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
  category: string;
  image: string;
  latin: string;
  description?: string;
  slug?: string;
  collectionSource?: string; // Added to track source collection
}

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

  try {
    console.time('[API /api/plant-data] ClientAcquired');
    const client = await clientPromise;
    console.timeEnd('[API /api/plant-data] ClientAcquired');

    const database = client.db(process.env.MONGODB_DB_NAME || 'plantdb');

    // Fetch categories
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
      _id: 'api-all-plants-default-id',
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

    // Fetch plants from both collections
    console.time('[API /api/plant-data] FetchPlantsForCategory');
    const plantCollection = database.collection<PlantDocument>('plants');
    const newPlantCollection = database.collection<PlantDocument>('newplants');

    let plantsQuery = {};
    if (resolvedSelectedCategory.slug !== 'all-plants') {
      plantsQuery = { category: resolvedSelectedCategory.name };
    }

    // Fetch from both collections concurrently
    const [plantsFromDb, newPlantsFromDb] = await Promise.all([
      plantCollection
        .find(plantsQuery, {
          projection: { _id: 1, name: 1, category: 1, image: 1, latin: 1, description: 1, slug: 1 },
        })
        .limit(100) // Reduced limit per collection to maintain total limit
        .toArray(),
      newPlantCollection
        .find(plantsQuery, {
          projection: { _id: 1, name: 1, category: 1, image: 1, latin: 1, description: 1, slug: 1 },
        })
        .limit(100)
        .toArray(),
    ]);

    // Combine and transform plants
    const plantsForCategory: Plant[] = [
      ...plantsFromDb.map((doc) => ({
        _id: doc._id.toString(),
        name: doc.name,
        category: doc.category,
        image: doc.image,
        latin: doc.latin,
        description: doc.description || '',
        slug: doc.slug,
        collectionSource: 'plants',
      })),
      ...newPlantsFromDb.map((doc) => ({
        _id: doc._id.toString(),
        name: doc.name,
        category: doc.category,
        image: doc.image,
        latin: doc.latin,
        description: doc.description || '',
        slug: doc.slug,
        collectionSource: 'newplants',
      })),
    ].slice(0, 200); // Ensure total limit of 200 plants

    console.timeEnd('[API /api/plant-data] FetchPlantsForCategory');
    console.log(`[API /api/plant-data] Fetched ${plantsForCategory.length} plants for selected category.`);

    // Calculate plant counts via aggregation from both collections
    console.time('[API /api/plant-data] CalculatePlantCounts');
    const [countsFromPlants, countsFromNewPlants] = await Promise.all([
      plantCollection.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]).toArray(),
      newPlantCollection.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]).toArray(),
    ]);

    // Merge counts
    const countsMap: Record<string, number> = {};
    let totalCount = 0;
    
    // Combine counts from both collections
    [...countsFromPlants, ...countsFromNewPlants].forEach((item: any) => {
      if (item._id) {
        countsMap[item._id] = (countsMap[item._id] || 0) + item.count;
        totalCount += item.count;
      }
    });

    const plantCounts: { [key: string]: number } = {};
    finalCategories.forEach((cat) => {
      if (cat.slug === 'all-plants') {
        plantCounts[cat.name] = totalCount;
      } else {
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
  }
}