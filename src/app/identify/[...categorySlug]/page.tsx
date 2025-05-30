import { headers } from 'next/headers';
import PlantSearchWrapper from '../../components/PlantSearchWrapper';
import { getServerSession } from 'next-auth/next';
import { authOptions, CustomSession } from '../../lib/auth';

// Consistent interfaces (matching API's response structure)
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
  params: Promise<{ categorySlug?: string[] }>;
}

async function getPlantPageData(categorySlug: string, token: string): Promise<PlantPageData> {
  const headerList = await headers();
  const host = headerList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const apiUrl = `${protocol}://${host}/api/plant-data?categorySlug=${categorySlug}`;

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`API Error (${response.status}) fetching ${apiUrl}: ${errorBody}`);
    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw new Error(`Failed to fetch plant data: ${response.status} - ${errorBody}`);
  }

  return response.json();
}

export default async function PlantIdentifier({ params }: PlantIdentifierProps) {
  const session = (await getServerSession(authOptions)) as CustomSession | null;
  const { categorySlug } = await params;
  const slug = categorySlug?.[0] || 'all-plants';

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
    if (!session || !session.apiAccessToken) {
      throw new Error('You need to be logged in to view plant data.');
    }
    pageData = await getPlantPageData(slug, session.apiAccessToken);
  } catch (error) {
    console.error('Error fetching page data in component:', error);
    errorFetchingData = error instanceof Error ? error.message : 'An unknown error occurred';
    pageData = {
      plants: [],
      categories: [fallbackCategory],
      plantCounts: {},
      selectedCategory: fallbackCategory,
    };
  }

  const { plants: displayedPlantsFromAPI, categories, plantCounts, selectedCategory } = pageData;

  const initialPlants = displayedPlantsFromAPI.map((plant) => ({
    ...plant,
    description: plant.description || '',
  }));

  if (errorFetchingData && !selectedCategory) {
    console.error('Critical error: No selectedCategory available even after fallback.');
    return <div>Error loading page. Please try refreshing.</div>;
  }

  return (
    <PlantSearchWrapper
      initialPlants={initialPlants}
      selectedCategory={selectedCategory}
      categories={categories}
      plantCounts={plantCounts}
    />
  );
}