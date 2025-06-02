// src/app/identify/[...categorySlug]/page.tsx
import { headers } from 'next/headers';
import PlantSearchWrapper from '../../components/PlantSearchWrapper'; // adjust if your folder structure differs

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

// Change here: `params` must be a Promise, not a plain object
interface PlantIdentifierProps {
  params: Promise<{ categorySlug?: string[] }>;
}

async function getPlantPageData(categorySlug: string): Promise<PlantPageData> {
  // ── HEADERS ──
  const headerList = await headers();
  const host = headerList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const apiUrl = `${protocol}://${host}/api/plant-data?categorySlug=${categorySlug}`;

  console.log(`[PlantIdentifier - getPlantPageData] Fetching from API URL: ${apiUrl}`);

  const response = await fetch(apiUrl, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `[PlantIdentifier - getPlantPageData] API Error (${response.status}) fetching ${apiUrl}: ${errorBody}`
    );
    throw new Error(`Failed to fetch plant data: ${response.status} - ${errorBody}`);
  }

  return response.json();
}

export default async function PlantIdentifier({ params }: PlantIdentifierProps) {
  // Await the params promise before using it
  const { categorySlug } = await params;
  const slug = categorySlug?.[0] || 'all-plants';

  console.log('[PlantIdentifier] Page rendering started.');
  console.log(`[PlantIdentifier] Determined slug: ${slug}`);

  let pageData: PlantPageData;
  let errorFetchingData: string | null = null;

  const fallbackCategory: Category = {
    _id: 'fallback-all-plants-id-page',
    name: 'All Plants',
    slug: 'all-plants',
    headerImage: 'https://myplantin.com/images/all-plants-header.jpg',
    title: 'All Plants (Error)',
    description: 'Error loading plants. Please try refreshing the page or check your connection.',
    mainDescription: 'Could not load plant data at this time.',
    expandedDescription:
      'There was an issue fetching plant details. If the problem persists, please contact support.',
  };

  try {
    pageData = await getPlantPageData(slug);
    console.log('[PlantIdentifier] Successfully fetched page data from API.');
  } catch (err) {
    console.error('[PlantIdentifier] Error fetching page data in component:', err);
    errorFetchingData = err instanceof Error ? err.message : 'Unknown error fetching data.';
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
        <p>A critical error occurred, and we couldn’t load the page content. Please try refreshing.</p>
        {process.env.NODE_ENV === 'development' && <p><i>Details: {errorFetchingData}</i></p>}
      </div>
    );
  }

  console.log('[PlantIdentifier] Rendering PlantSearchWrapper with:', {
    initialPlantCount: initialPlants.length,
    selectedCategoryName: selectedCategory?.name,
    categoryCount: categories.length,
    plantCountsKeys: Object.keys(plantCounts).length > 0,
  });

  return (
    <PlantSearchWrapper
      initialPlants={initialPlants}
      selectedCategory={selectedCategory}
      categories={categories}
      plantCounts={plantCounts}
      // ── Removed unsupported `errorMessage` prop here ──
    />
  );
}
