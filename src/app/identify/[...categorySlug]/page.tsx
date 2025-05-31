// src/app/identify/[...categorySlug]/page.tsx (or your actual path)
import { headers } from 'next/headers';
import PlantSearchWrapper from '../../components/PlantSearchWrapper'; // Adjust path
// getServerSession, authOptions, CustomSession are no longer needed for this specific page's data fetching

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

interface PlantPageData {
  plants: Plant[];
  categories: Category[];
  plantCounts: { [key: string]: number };
  selectedCategory: Category;
}

interface PlantIdentifierProps {
  // params can be awaited directly in Server Components with App Router
  params: { categorySlug?: string[] };
}

// Simplified getPlantPageData, no token needed
async function getPlantPageData(categorySlug: string): Promise<PlantPageData> {
  const headerList = headers(); // For constructing absolute URL to internal API
  const host = headerList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  // Ensure this path matches your API route: /api/plant-data
  const apiUrl = `${protocol}://${host}/api/plant-data?categorySlug=${categorySlug}`;

  console.log(`[PlantIdentifier - getPlantPageData] Fetching from API URL: ${apiUrl}`);

  const response = await fetch(apiUrl, {
    // No Authorization header needed now
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // Keep for dynamic data, or consider 'force-cache' with revalidation if data changes infrequently
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[PlantIdentifier - getPlantPageData] API Error (${response.status}) fetching ${apiUrl}: ${errorBody}`);
    // No 401/403 specific handling needed if API is public
    throw new Error(`Failed to fetch plant data: ${response.status} - ${errorBody}`);
  }

  return response.json();
}

export default async function PlantIdentifier({ params }: PlantIdentifierProps) {
  console.log('[PlantIdentifier] Page rendering started.');
  // No session fetching needed here for plant data
  // const session = (await getServerSession(authOptions)) as CustomSession | null;
  // console.log('[PlantIdentifier] Session:', session ? `User: ${session.user?.email}` : 'No session');

  const categorySlugParam = params.categorySlug;
  const slug = categorySlugParam?.[0] || 'all-plants';
  console.log(`[PlantIdentifier] Determined slug: ${slug}`);

  let pageData: PlantPageData;
  let errorFetchingData: string | null = null;

  const fallbackCategory: Category = {
    _id: 'fallback-all-plants-id-page',
    name: 'All Plants',
    slug: 'all-plants',
    headerImage: 'https://myplantin.com/images/all-plants-header.jpg', // Use your actual fallback image
    title: 'All Plants (Error)',
    description: 'Error loading plants. Please try refreshing the page or check your connection.',
    mainDescription: 'Could not load plant data at this time.',
    expandedDescription: 'There was an issue fetching plant details. If the problem persists, please contact support.',
  };

  try {
    // Directly call getPlantPageData without token logic
    pageData = await getPlantPageData(slug);
    console.log('[PlantIdentifier] Successfully fetched page data from API.');
  } catch (error) {
    console.error('[PlantIdentifier] Error fetching page data in component:', error);
    errorFetchingData = error instanceof Error ? error.message : 'An unknown error occurred while fetching data.';
    pageData = {
      plants: [],
      categories: [fallbackCategory],
      plantCounts: {},
      selectedCategory: fallbackCategory,
    };
    console.log('[PlantIdentifier] Using fallback data due to error.');
  }

  const { plants: displayedPlantsFromAPI, categories, plantCounts, selectedCategory } = pageData;

  const initialPlants = displayedPlantsFromAPI.map((plant) => ({
    ...plant,
    description: plant.description || '',
  }));

  if (errorFetchingData && !selectedCategory) {
    console.error('[PlantIdentifier] Critical error: No selectedCategory available even after fallback.');
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Error Loading Page</h1>
            <p>A critical error occurred, and we couldn't load the page content. Please try refreshing.</p>
            {process.env.NODE_ENV === 'development' && <p><i>Details: {errorFetchingData}</i></p>}
        </div>
    );
  }

  console.log('[PlantIdentifier] Rendering PlantSearchWrapper with:', {
    initialPlantCount: initialPlants.length,
    selectedCategoryName: selectedCategory?.name,
    categoryCount: categories.length,
    plantCountsKeys: Object.keys(plantCounts).length > 0, // boolean for easier check in wrapper
  });

  return (
    <PlantSearchWrapper
      initialPlants={initialPlants}
      selectedCategory={selectedCategory}
      categories={categories}
      plantCounts={plantCounts}
      errorMessage={errorFetchingData}
    />
  );
}