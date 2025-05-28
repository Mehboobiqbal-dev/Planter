// src/app/identify/[...categorySlug]/page.tsx
// import { MongoClient } from 'mongodb'; // No longer needed here directly
import PlantIdentifierWrapper from '../../components/PlantIdentifierWrapper';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { headers } from 'next/headers';

// Consistent interfaces (should match API's response structure)
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
  description?: string; // Optional as per your API and previous definition
  slug?: string;
}

interface PlantPageData {
  plants: Plant[];
  categories: Category[];
  plantCounts: { [key: string]: number };
  selectedCategory: Category;
}

interface PlantIdentifierProps {
  params: { categorySlug?: string[] };
}

// Helper function to fetch data from our API route
async function getPlantPageData(categorySlug: string): Promise<PlantPageData> {
  const headerList = await headers(); // <-- FIX 1: Added await here
  const host = headerList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const apiUrl = `${protocol}://${host}/api/plant-data?categorySlug=${categorySlug}`;

  const token = process.env.INTERNAL_API_TOKEN || "your-internal-api-token-if-needed";

  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`API Error (${response.status}) fetching ${apiUrl}: ${errorBody}`);
    throw new Error(`Failed to fetch plant data from API: ${response.statusText} - ${errorBody}`);
  }
  return response.json();
}

export default async function PlantIdentifier({ params }: PlantIdentifierProps) {
  const slug = params.categorySlug?.[0] || 'all-plants';

  let pageData: PlantPageData;
  let errorFetchingData: string | null = null;

  const fallbackCategory: Category = {
    _id: 'fallback-all-plants-id',
    name: 'All Plants',
    slug: 'all-plants',
    headerImage: 'https://myplantin.com/images/all-plants-header.jpg',
    title: 'All Plants',
    description: 'Error loading plants. Please try again.',
    mainDescription: 'Could not load plant data.',
    expandedDescription: 'There was an issue fetching plant details.',
  };

  try {
    pageData = await getPlantPageData(slug);
  } catch (error) {
    console.error("Error fetching page data in component:", error);
    errorFetchingData = error instanceof Error ? error.message : "An unknown error occurred";
    pageData = {
      plants: [],
      categories: [fallbackCategory],
      plantCounts: {},
      selectedCategory: fallbackCategory,
    };
  }

  const {
    plants: displayedPlantsFromAPI,
    categories,
    plantCounts,
    selectedCategory,
  } = pageData;

  // FIX 3: Address the type mismatch for Plant's description property
  // The PlantIdentifierWrapper expects `description: string`, but our API and page
  // define it as `description?: string`. We need to provide a default.
  const displayedPlants = displayedPlantsFromAPI.map(plant => ({
    ...plant,
    description: plant.description || "", // Provide default empty string if undefined
  }));


  if (errorFetchingData && !selectedCategory) {
      // This case should ideally be handled by the fallback in the catch block,
      // but as a safety net:
      console.error("Critical error: No selectedCategory available even after fallback.");
      return <div>Error loading page. Please try refreshing.</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <header
        className="shadow relative flex p-5"
        style={{ background: 'linear-gradient(to right, #DDF9D5, #BEFFE4)' }}
      >
        <div className="flex-grow flex items-start justify-start text-left">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="text-sm text-gray-700">
              <span>PlantIn</span>
              <span className="mx-1">/</span>
              <span className="text-gray-600">{selectedCategory?.name || 'Category'} Identifier</span>
            </div>
            <p className="mt-3 md:text-3xl text-2xl font-extrabold text-left w-full py-4">
              {selectedCategory?.title || <Skeleton width={200} />}
            </p>
            <p className="text-sm xl:max-w-[760px] lg:max-w-[640px] md:max-w-[520px]">
              {selectedCategory?.description || <Skeleton count={3} />}
            </p>
            <div className="mt-4 flex items-center">
              <input
                type="text"
                className="relative flex items-center gap-2 md:h-14 h-12 w-full md:w-[400px] lg:w-[500px] bg-white rounded-2xl px-4 text-sm mr-2"
                placeholder="Find a plant by name"
              />
              <div className="flex-none">
                <button className="rounded-[30px] font-semibold text-white bg-gradient-to-r from-[#04BF94] to-[#52C8AD] hover:from-[#06D3A4] hover:to-[#60E7C8] md:w-[250px] md:h-[60px] w-12 h-12 flex items-center justify-center gap-2">
                  <img
                    src="https://myplantin.com/icons/camera.svg"
                    alt="Camera Icon"
                    className="w-6 h-6"
                  />
                  <span className="hidden md:inline">Identify a plant</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[45%] h-full flex items-center justify-center">
          {selectedCategory?.headerImage ? (
            <img
              src={selectedCategory.headerImage}
              alt={`${selectedCategory.name || 'Category'} Illustration`}
              className="w-full h-[70%] object-contain"
            />
          ) : (
            <Skeleton className="w-full h-[70%]" />
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {errorFetchingData && (
          <div className="text-red-500 bg-red-100 p-4 rounded mb-4">
            Error fetching plant data: {errorFetchingData}. Displaying default content where possible.
          </div>
        )}
        <div className="flex flex-col md:flex-row">
          {selectedCategory ? (
            <PlantIdentifierWrapper
              key={selectedCategory._id}
              initialSelectedCategory={selectedCategory}
              initialDisplayedPlants={displayedPlants} 
              initialCategories={categories}
              initialPlantCounts={plantCounts}
              initialMainDescription={selectedCategory.mainDescription}
              initialExpandedDescription={selectedCategory.expandedDescription}
            />
          ) : (
             <div>Loading category data or category not found...</div> 
          )}
        </div>
      </div>
    </div>
  );
}