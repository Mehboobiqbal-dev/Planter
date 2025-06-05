import { NextResponse } from "next/server";
import { MongoClient, Document } from "mongodb";

// Interfaces (ensure these match your actual data structures)
interface Category {
  name: string;
  slug: string;
  headerImage: string;
  title: string;
  description: string;
  mainDescription: string;
  commonProblemsDescription: string;
  diagnosisSteps: string;
}

interface Problem {
  _id: string; // For React key and actual problems: MongoDB ObjectId string. For plants in 'weeds': `plant--${plantMongoId}`
  image: string;
  title: string;
  description: string;
  category: string; // The problem category slug (e.g., "pests", "weeds")
  plantSlug?: string; // Populated ONLY for plants shown in 'weeds' category, e.g., "tiger-jaws"
}

interface ProblemData {
  problems: Problem[];
  categories: Category[];
  selectedCategory: Category;
}

// From /api/plant-data
interface ApiPlantDataPlant {
  _id: string; // Plant's MongoDB ObjectId string
  name: string;
  category: string; // Plant's own category e.g., "Succulents"
  image: string;
  latin: string;
  description?: string;
  slug?: string; // <<< CRUCIAL: e.g., "tiger-jaws"
}

interface ApiPlantDataResponse {
  plants: ApiPlantDataPlant[];
}


export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const categorySlug = searchParams.get("categorySlug") || "all-problem";

  console.log(`[API /api/problems] Request for categorySlug: ${categorySlug}`);

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("[API /api/problems] MONGODB_URI is not defined");
    return NextResponse.json({ error: "MONGODB_URI is not defined" }, { status: 500 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db("plantdb"); // Your DB name

    // --- Fetch Problem Categories ---
    const categoryCollection = database.collection<Document>("problemCategories");
    const categoriesFromDb = await categoryCollection.find({}).toArray();
    const categories: Category[] = categoriesFromDb.map((doc) => ({
      name: doc.name,
      slug: doc.slug,
      headerImage: doc.headerImage,
      title: doc.title,
      description: doc.description,
      mainDescription: doc.mainDescription,
      commonProblemsDescription: doc.commonProblemsDescription || "",
      diagnosisSteps: doc.diagnosisSteps || "",
    }));

    let selectedCategory =
      categories.find((cat) => cat.slug === categorySlug) ||
      categories.find((cat) => cat.slug === "all-problem");

    if (!selectedCategory) {
      // Basic fallback for selected category if not found (and 'all-problem' is missing)
      const fallbackAllProblemCategory: Category = {
        name: "All Problems", slug: "all-problem", headerImage: "/images/default-header.jpg",
        title: "All Plant Problems", description: "Browse problems", mainDescription: "...",
        commonProblemsDescription: "...", diagnosisSteps: "..."
      };
      if (!categories.find(c => c.slug === 'all-problem')) {
        categories.unshift(fallbackAllProblemCategory);
      }
      selectedCategory = fallbackAllProblemCategory;
      console.warn(`[API /api/problems] Category '${categorySlug}' not found, falling back to 'all-problem'. Ensure 'all-problem' and requested categories exist in 'problemCategories' collection.`);
    }

    let filteredProblems: Problem[] = [];

    if (selectedCategory.slug === "weeds") {
      console.log(`[API /api/problems] 'weeds' category selected. Fetching plants from /api/plant-data.`);
      const plantDataUrl = `${origin}/api/plant-data?categorySlug=all-plants`; // Internal call
      
      try {
        const plantDataResponse = await fetch(plantDataUrl);
        if (!plantDataResponse.ok) {
          const errorText = await plantDataResponse.text();
          console.error(`[API /api/problems] Failed to fetch from ${plantDataUrl}: ${plantDataResponse.status} - ${errorText}`);
          // Keep filteredProblems empty or handle error appropriately
        } else {
          const plantApiData: ApiPlantDataResponse = await plantDataResponse.json();
          const allPlantsFromApi = plantApiData.plants || [];
          
          console.log(`[API /api/problems] Received ${allPlantsFromApi.length} plants from /api/plant-data.`);

          // Filter for Succulents/Shrubs AND ensure they have a valid slug
          const plantsForWeedsCategory = allPlantsFromApi
            .filter(plant =>
              (plant.category === 'Succulents' || plant.category === 'Shrubs') &&
              plant.slug && typeof plant.slug === 'string' && plant.slug.trim() !== ''
            )
            .map((plant: ApiPlantDataPlant): Problem => ({
              _id: `plant--${plant._id}`, // Unique ID for React key
              image: plant.image || "/images/default-plant-image.jpg",
              title: plant.name,
              description: plant.description || `Learn more about ${plant.name}.`,
              category: 'weeds', // Set their problem category to 'weeds'
              plantSlug: plant.slug!,  // Assign the plant's actual slug
            }));
          
          console.log(`[API /api/problems] Mapped ${plantsForWeedsCategory.length} plants (Succulents/Shrubs with slugs) to 'Problem' objects for 'weeds' category. First few:`, JSON.stringify(plantsForWeedsCategory.slice(0,2), null, 2));
          filteredProblems = plantsForWeedsCategory;
        }
      } catch (e: any) {
        console.error(`[API /api/problems] Error fetching or processing plants for 'weeds': ${e.message}`);
      }
    } else {
      // --- Fetch "Actual" Problems for other categories or "all-problem" ---
      const problemCollection = database.collection<Document>("problems");
      const dbQuery = selectedCategory.slug === "all-problem" ? {} : { category: selectedCategory.slug };
      const problemsFromDb = await problemCollection.find(dbQuery).toArray();
      
      filteredProblems = problemsFromDb.map((doc): Problem => ({
        _id: doc._id.toString(),
        image: doc.image,
        title: doc.title,
        description: doc.description,
        category: doc.category, // This is the problem's own category slug
        // plantSlug will be undefined for actual problems
      }));
      console.log(`[API /api/problems] Fetched ${filteredProblems.length} actual problems for category '${selectedCategory.slug}'.`);
    }

    const responseData: ProblemData = {
      problems: filteredProblems,
      categories,
      selectedCategory,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error(`[API /api/problems] General error: ${error.message}`, error.stack);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}