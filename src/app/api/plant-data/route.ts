// src/app/api/plant-data/route.ts
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb"; // ObjectId might not be needed here but good for general use

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

export async function GET(request: Request) {
  // Removed: JWT verification

  // Extract categorySlug
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("categorySlug") || "all-plants";

  // MongoDB connection
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined in API route");
    return NextResponse.json({ error: "MONGODB_URI is not defined" }, { status: 500 });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("plantdb");

    // Fetch and format categories
    const categoryCollection = database.collection<Omit<Category, '_id'>>("categories");
    const categoriesFromDb = await categoryCollection.find({}).toArray();
    const categories: Category[] = categoriesFromDb.map((doc: any) => ({
      _id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      headerImage: doc.headerImage,
      title: doc.title,
      description: doc.description,
      mainDescription: doc.mainDescription,
      expandedDescription: doc.expandedDescription,
    }));

    const allPlantsCategoryDefault: Category = {
      _id: 'default-all-plants-id',
      name: 'All Plants',
      slug: 'all-plants',
      headerImage: 'https://myplantin.com/images/all-plants-header.jpg',
      title: 'All Plants',
      description: 'Browse all available plants.',
      mainDescription: 'A comprehensive collection of plants.',
      expandedDescription: 'Find the perfect plant for any environment.',
    };

    let selectedCategory = categories.find((cat) => cat.slug === categorySlug);

    if (!selectedCategory) {
      if (categorySlug === "all-plants") {
        selectedCategory = allPlantsCategoryDefault;
        if (!categories.find(c => c.slug === 'all-plants')) {
          categories.unshift(allPlantsCategoryDefault);
        }
      } else {
        selectedCategory = categories.find((cat) => cat.slug === "all-plants") || allPlantsCategoryDefault;
      }
    }

    if (!selectedCategory) {
      return NextResponse.json({ error: "Category not found and 'all-plants' fallback failed" }, { status: 404 });
    }

    const plantCollection = database.collection<Omit<Plant, '_id'>>("plants");
    let plantsQuery = {};
    if (selectedCategory.slug !== "all-plants") {
      plantsQuery = { category: selectedCategory.name };
    }

    const plantsFromDb = await plantCollection.find(plantsQuery, {
      projection: {
        _id: 1,
        name: 1,
        category: 1,
        image: 1,
        latin: 1,
        description: 1,
        slug: 1,
      }
    }).toArray();

    const plantsForCategory: Plant[] = plantsFromDb.map((doc: any) => ({
      _id: doc._id.toString(),
      name: doc.name,
      category: doc.category,
      image: doc.image,
      latin: doc.latin,
      description: doc.description,
      slug: doc.slug,
    }));

    const allPlantsForCounting = await plantCollection.find({}, { projection: { category: 1 } }).toArray();
    const plantCounts: { [key: string]: number } = {};

    categories.forEach((cat) => {
      if (cat.slug === "all-plants") {
        plantCounts[cat.name] = allPlantsForCounting.length;
      } else {
        plantCounts[cat.name] = allPlantsForCounting.filter((p: any) => p.category === cat.name).length;
      }
    });

    const responseData: ApiPlantDataResponse = {
      plants: plantsForCategory,
      categories,
      plantCounts,
      selectedCategory,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error in API route /api/plant-data:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    await client.close();
  }
}
