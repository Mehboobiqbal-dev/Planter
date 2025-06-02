// src/app/api/plant-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

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

interface Plant {
  _id: string;
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

// If you already have a `clientPromise` (recommended), uncomment the next line and comment out the MongoClient instantiation below.
// import clientPromise from '../../../../lib/mongodb';

export async function GET(request: NextRequest) {
  console.log('[API /api/plant-data] GET request received (No Auth).');

  const { searchParams } = new URL(request.url);
  const requestedCategorySlug = searchParams.get('categorySlug') || 'all-plants';
  console.log(`[API /api/plant-data] Requested categorySlug: ${requestedCategorySlug}`);

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[API /api/plant-data] MONGODB_URI is not defined.');
    return NextResponse.json(
      { error: 'Server configuration error: MONGODB_URI is not defined.' },
      { status: 500 }
    );
  }

  // Use clientPromise if you have it; otherwise create a new client
  // const client = await clientPromise;
  const client = new MongoClient(uri);

  try {
    console.time('[API /api/plant-data] DBConnect');
    await client.connect();
    console.timeEnd('[API /api/plant-data] DBConnect');

    const database = client.db('plantdb'); // ← make sure this matches your actual DB name

    // ─────────────── Fetch categories ───────────────
    console.time('[API /api/plant-data] FetchCategories');
    const categoryCollection = database.collection('categories');
    const categoriesFromDbRaw = await categoryCollection.find({}).toArray();
    const dbCategories: Category[] = categoriesFromDbRaw.map((doc: any) => ({
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

    // Ensure “All Plants” always appears first
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
    }

    // Decide which category is selected
    let resolvedSelectedCategory: Category;
    if (requestedCategorySlug === 'all-plants') {
      resolvedSelectedCategory = allPlantsCategoryInList;
    } else {
      resolvedSelectedCategory =
        finalCategories.find(cat => cat.slug === requestedCategorySlug) || allPlantsCategoryInList;
    }
    console.log(`[API /api/plant-data] Resolved selectedCategory: ${resolvedSelectedCategory.name}`);

    // ─────────────── Fetch plants for that category ───────────────
    const plantCollection = database.collection('plants');
    let plantsQuery = {};
    if (resolvedSelectedCategory.slug !== 'all-plants') {
      // Make sure 'category' field is indexed in MongoDB for performance
      plantsQuery = { category: resolvedSelectedCategory.name };
    }

    console.time('[API /api/plant-data] FetchPlantsForCategory');
    // Only project necessary fields, and limit to 200
    const plantsForCategoryDb = await plantCollection
      .find(plantsQuery, {
        projection: { _id: 1, name: 1, category: 1, image: 1, latin: 1, description: 1, slug: 1 },
      })
      .limit(200)
      .toArray();
    console.timeEnd('[API /api/plant-data] FetchPlantsForCategory');

    const plantsForCategory: Plant[] = plantsForCategoryDb.map((doc: any) => ({
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
    // This replaces the old code that did `find({}, {projection: {category:1}}).toArray()` then filtered in JS.
    console.time('[API /api/plant-data] CalculatePlantCounts');
    const countsCursor = plantCollection.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    const countsArray = await countsCursor.toArray();
    // countsArray looks like: [ { _id: 'Ferns', count: 123 }, { _id: 'Succulents', count: 456 }, … ]

    // Build a quick lookup map from category name → count
    const countsMap: Record<string, number> = {};
    let totalCount = 0;
    countsArray.forEach((item: any) => {
      countsMap[item._id] = item.count;
      totalCount += item.count;
    });

    // Now assemble plantCounts for each category in finalCategories
    const plantCounts: { [key: string]: number } = {};
    finalCategories.forEach((cat) => {
      if (cat.slug === 'all-plants') {
        // “All Plants” gets the total of everything
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
  } finally {
    console.time('[API /api/plant-data] DBClose');
    if (client) {
      await client.close();
    }
    console.timeEnd('[API /api/plant-data] DBClose');
  }
}
