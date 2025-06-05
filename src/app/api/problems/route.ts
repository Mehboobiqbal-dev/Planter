import { NextResponse } from "next/server";
import { MongoClient, Document, ObjectId } from "mongodb";

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
  _id: string;
  image: string;
  title: string;
  description: string;
  category: string;   // must exactly match categories.slug (case‐insensitive)
  plantSlug?: string; // only populated when category === "weeds"
}

interface ProblemData {
  problems: Problem[];
  categories: Category[];
  selectedCategory: Category;
}

// From /api/plant-data:
interface ApiPlantDataPlant {
  _id: string;        // the plant’s ObjectId as string
  name: string;
  category: string;   // e.g. "Succulents", "Shrubs"
  image: string;
  latin: string;
  description?: string;
  slug?: string;      // e.g. "tiger-jaws"
}

interface ApiPlantDataResponse {
  plants: ApiPlantDataPlant[];
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  // Always lowercase and trim incoming slug to avoid whitespace/case issues:
  const rawSlug = searchParams.get("categorySlug") || "all-problem";
  const categorySlug = rawSlug.trim().toLowerCase();
  console.log(`[API /api/problems] Requested slug: '${categorySlug}'`);

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("[API /api/problems] MONGODB_URI is not defined");
    return NextResponse.json({ error: "MONGODB_URI is not defined" }, { status: 500 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db("plantdb"); // ← replace “plantdb” if your DB name differs

    // === 1) Load all categories from the DB ===
    const categoryCollection = database.collection<Document>("problemCategories");
    const categoriesFromDb = await categoryCollection.find({}).toArray();
    const categories: Category[] = categoriesFromDb.map((doc) => ({
      name: doc.name as string,
      // We lowercase+trim the slug so that "Pests ", "pests", "PESTS" all become "pests"
      slug: (doc.slug as string).trim().toLowerCase(),
      headerImage: doc.headerImage as string,
      title: doc.title as string,
      description: doc.description as string,
      mainDescription: doc.mainDescription as string,
      commonProblemsDescription: (doc.commonProblemsDescription as string) || "",
      diagnosisSteps: (doc.diagnosisSteps as string) || "",
    }));

    console.log(
      "[API /api/problems] Available category slugs:",
      categories.map((c) => c.slug)
    );

    // === 2) Figure out which category was actually requested ===
    let selectedCategory: Category | undefined = categories.find((c) => c.slug === categorySlug);

    // If we didn't find it, try to fall back to "all-problem"
    if (!selectedCategory) {
      selectedCategory = categories.find((c) => c.slug === "all-problem");
    }
    // If DB also doesn't have "all-problem", inject a fallback at index 0
    if (!selectedCategory) {
      const fallback: Category = {
        name: "All Problems",
        slug: "all-problem",
        headerImage: "/images/default-header.jpg",
        title: "All Plant Problems",
        description: "Browse every type of problem",
        mainDescription: "All problems (diseases, pests, and weeds) are shown here.",
        commonProblemsDescription: "",
        diagnosisSteps: "",
      };
      categories.unshift(fallback);
      selectedCategory = fallback;
      console.warn(
        `[API /api/problems] Neither '${categorySlug}' nor 'all-problem' was found. Inserted fallback 'all-problem'.`
      );
    }

    // === 3) Build the array of Problem items ===
    let filteredProblems: Problem[] = [];

    // Helper: fetch all Succulents/Shrubs from /api/plant-data
    async function fetchWeeds(): Promise<Problem[]> {
      const plantDataUrl = `${origin}/api/plant-data?categorySlug=all-plants`;
      console.log(`[API /api/problems] Fetching from ${plantDataUrl} for weeds…`);
      try {
        const plantDataResponse = await fetch(plantDataUrl);
        if (!plantDataResponse.ok) {
          const errText = await plantDataResponse.text();
          console.error(
            `[API /api/problems] /api/plant-data returned ${plantDataResponse.status} - ${errText}`
          );
          return [];
        }
        const plantApiData: ApiPlantDataResponse = await plantDataResponse.json();
        const allPlants = plantApiData.plants || [];

        // Keep only Succulents or Shrubs that have a nonempty slug string
        const plantsForWeeds = allPlants
          .filter(
            (p) =>
              (p.category === "Succulents" || p.category === "Shrubs") &&
              typeof p.slug === "string" &&
              p.slug.trim().length > 0
          )
          .map((p) => ({
            _id: `plant--${p._id}`,                     // unique React key
            image: p.image || "/images/default-plant.jpg",
            title: p.name,
            description: p.description || `Learn more about ${p.name}.`,
            category: "weeds",                          // forced category
            plantSlug: p.slug!.trim(),                  // e.g. "tiger-jaws"
          }));

        console.log(
          `[API /api/problems] Mapped ${plantsForWeeds.length} plant→Problem for weeds.`
        );
        return plantsForWeeds;
      } catch (err: any) {
        console.error(`[API /api/problems] Error while fetching weeds: ${err.message}`);
        return [];
      }
    }

    // 3A) If user asked specifically for "weeds", return only plant‐based items
    if (selectedCategory.slug === "weeds") {
      filteredProblems = await fetchWeeds();
    }
    // 3B) If user asked for "all‐problem", combine all actual DB problems + weeds
    else if (selectedCategory.slug === "all-problem") {
      // Fetch **all** documents from the MongoDB "problems" collection
      const problemCollection = database.collection<Document>("problems");
      const allProblemsFromDb = await problemCollection.find({}).toArray();
      const actualProblems: Problem[] = allProblemsFromDb.map((doc) => ({
        _id: (doc._id as ObjectId).toString(),
        image: doc.image as string,
        title: doc.title as string,
        description: doc.description as string,
        // Lowercase so that `category: "pests"` vs `category: "Pests"` both become "pests"
        category: (doc.category as string).trim().toLowerCase(),
      }));

      // Fetch every Succulents/Shrubs from /api/plant-data
      const weedProblems = await fetchWeeds();

      // Merge them into one array
      filteredProblems = [...actualProblems, ...weedProblems];
    }
    // 3C) Otherwise, user requested something like "pests" or "diseases"
    else {
      // We do a **case-insensitive regex** match on the exact slug:
      // If slug is "pests", we match category: /^pests$/i
      const problemCollection = database.collection<Document>("problems");
      const dbQuery = {
        category: { $regex: new RegExp(`^${selectedCategory.slug}$`, "i") },
      };
      const problemsFromDb = await problemCollection.find(dbQuery).toArray();

      filteredProblems = problemsFromDb.map((doc) => ({
        _id: (doc._id as ObjectId).toString(),
        image: doc.image as string,
        title: doc.title as string,
        description: doc.description as string,
        category: (doc.category as string).trim().toLowerCase(),
      }));

      console.log(
        `[API /api/problems] Queried category='${selectedCategory.slug}' (case-insensitive). Found ${filteredProblems.length} documents.`
      );
    }

    // === 4) Return the aggregated JSON ===
    const responseData: ProblemData = {
      problems: filteredProblems,
      categories,
      selectedCategory,
    };
    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error(`[API /api/problems] General error: ${err.message}\n${err.stack}`);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await client.close();
  }
}
