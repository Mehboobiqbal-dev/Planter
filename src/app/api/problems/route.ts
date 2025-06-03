// src/app/api/problems/route.ts
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb"; // Import ObjectId

// Interface for Problem Categories (from problemCategories collection)
interface ProblemCategory {
  name: string;
  slug: string;
  headerImage: string;
  title: string;
  description: string;
  mainDescription: string;
  commonProblemsDescription: string;
  diagnosisSteps: string;
}

// Interface for items displayed in the list (can be actual problems or transformed plants)
interface DisplayableProblemItem {
  _id: string;
  image: string;
  title: string;
  description: string;
  category: string; // Category SLUG this item belongs to (e.g., "pests", or for a plant, "cactuses")
}

// Interface for Plant documents from the 'plants' collection
interface PlantDocument {
  _id: ObjectId | string; // MongoDB ObjectId or string
  name: string;
  category: string; // Plant category NAME (e.g., "Cactuses", "Succulents")
  image: string;
  latin?: string;
  description?: string;
  slug?: string; // Slug for the plant's own detail page (e.g., "blue-star-fern")
}

// API response structure
interface ProblemDataResponse {
  problems: DisplayableProblemItem[];
  categories: ProblemCategory[]; // List of all problem categories
  selectedCategory: ProblemCategory; // The currently viewed problem category (e.g., "Weeds")
}

// Target plant category NAMES to display under "Weeds"
const targetPlantCategoryNames = ['Cactuses', 'Succulents', 'Flowers', 'Ferns', 'Shrubs'];

// Helper function to generate a slug from a name (e.g., "Cactuses" -> "cactuses")
const generateSlugFromName = (name: string): string => {
  if (!name) return '';
  return name.toLowerCase().replace(/\s+/g, '-');
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlugFromQuery = searchParams.get("categorySlug") || "all-problem";

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("[API /api/problems] MONGODB_URI is not defined.");
    return NextResponse.json(
      { error: "Server configuration error: MONGODB_URI is not defined." },
      { status: 500 }
    );
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("plantdb"); // Ensure this is your database name

    // 1. Fetch all problem categories (Pests, Diseases, Weeds, etc.)
    const problemCategoryCollection = database.collection("problemCategories");
    const problemCategoriesFromDb = await problemCategoryCollection.find({}).toArray();
    const allProblemCategories: ProblemCategory[] = problemCategoriesFromDb.map((doc: any) => ({
      name: doc.name,
      slug: doc.slug,
      headerImage: doc.headerImage,
      title: doc.title,
      description: doc.description,
      mainDescription: doc.mainDescription,
      commonProblemsDescription: doc.commonProblemsDescription || '',
      diagnosisSteps: doc.diagnosisSteps || '',
    }));

    // 2. Determine the selected problem category based on the query slug
    let selectedProblemCategory =
      allProblemCategories.find((cat) => cat.slug === categorySlugFromQuery) ||
      allProblemCategories.find((cat) => cat.slug === "all-problem"); // Fallback to "all-problem"

    if (!selectedProblemCategory) {
      // This would only happen if categorySlugFromQuery is invalid AND "all-problem" category doesn't exist
      console.warn(`[API /api/problems] Category slug '${categorySlugFromQuery}' not found, and 'all-problem' fallback failed.`);
      return NextResponse.json(
        { error: `Problem category '${categorySlugFromQuery}' not found.` },
        { status: 404 }
      );
    }

    let itemsToList: DisplayableProblemItem[] = [];

    // 3. Special handling if the selected problem category is "weeds"
    if (selectedProblemCategory.slug === "weeds") {
      console.log("[API /api/problems] Handling special case for 'weeds' category. Fetching specified plants.");
      const plantCollection = database.collection<PlantDocument>("plants");
      
      // Fetch plants from the 'plants' collection that match the target categories
      const plantsFromDb = await plantCollection.find({
        category: { $in: targetPlantCategoryNames } // Query by plant category NAME
      }).limit(50) // Optional: limit the number of plants shown
        .toArray();

      itemsToList = plantsFromDb.map((plantDoc) => ({
        _id: plantDoc._id.toString(),
        image: plantDoc.image || 'https://via.placeholder.com/300x200?text=Plant+Image', // Fallback image
        title: plantDoc.name,
        description: plantDoc.description || `Learn more about ${plantDoc.name}.`, // Fallback description
        // 'category' here is the plant's *original* category slug (e.g., "cactuses")
        // This is used by the frontend's redirection logic for detail pages.
        category: generateSlugFromName(plantDoc.category), 
      }));
      console.log(`[API /api/problems] Fetched ${itemsToList.length} plants for 'weeds' category display.`);

    } else { // Standard handling for "all-problem" or other specific problem categories (Pests, Diseases, etc.)
      console.log(`[API /api/problems] Handling standard category: '${selectedProblemCategory.slug}'. Fetching actual problems.`);
      const actualProblemsCollection = database.collection("problems");
      
      // Fetch actual problems from the 'problems' collection
      // The 'category' field in 'problems' collection is assumed to store the problem category SLUG
      let query = {};
      if (selectedProblemCategory.slug !== "all-problem") {
        query = { category: selectedProblemCategory.slug };
      }
      
      const actualProblemsFromDb = await actualProblemsCollection.find(query).toArray();
      
      itemsToList = actualProblemsFromDb.map((doc: any) => ({
        _id: doc._id.toString(),
        image: doc.image,
        title: doc.title,
        description: doc.description,
        category: doc.category, // This is the problem's own category slug
      }));
      console.log(`[API /api/problems] Fetched ${itemsToList.length} actual problems for '${selectedProblemCategory.slug}'.`);
    }

    const responseData: ProblemDataResponse = {
      problems: itemsToList,
      categories: allProblemCategories,
      selectedCategory: selectedProblemCategory,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("[API /api/problems] Critical error in API route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown internal server error occurred.";
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}