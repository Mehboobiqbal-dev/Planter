import { MongoClient } from 'mongodb';
import PlantIdentifierWrapper from '../../components/PlantIdentifierWrapper';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Category {
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
  description: string;
}

interface PlantData {
  plants: Plant[];
  categories: Category[];
}

interface PlantIdentifierProps {
  params: Promise<{ categorySlug: string[] }>;
}

const getPlantData = async (): Promise<PlantData> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in environment variables');

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('plantdb');

    const plantDocs = await db.collection('plants').find({}).toArray();
    const plants: Plant[] = plantDocs.map((doc) => ({
      _id: doc._id.toString(),
      name: doc.name,
      category: doc.category,
      image: doc.image,
      description: doc.description,
    }));

    const categoryDocs = await db.collection('categories').find({}).toArray();
    const categories: Category[] = categoryDocs.map((doc) => ({
      name: doc.name,
      slug: doc.slug,
      headerImage: doc.headerImage,
      title: doc.title,
      description: doc.description,
      mainDescription: doc.mainDescription,
      expandedDescription: doc.expandedDescription,
    }));

    return { plants, categories };
  } finally {
    await client.close();
  }
};

export default async function PlantIdentifier({ params }: PlantIdentifierProps) {
  const resolvedParams = await params;
  const plantData = await getPlantData();
  const { plants, categories } = plantData;

  const slug = resolvedParams.categorySlug?.[0] || 'all-plants';
  const selectedCategory =
    categories.find((cat) => cat.slug === slug) || categories.find((cat) => cat.slug === 'all-plants')!;

  const displayedPlants =
    selectedCategory.slug === 'all-plants'
      ? plants
      : plants.filter((plant) => plant.category === selectedCategory.name);

  const plantCounts: { [key: string]: number } = {};
  categories.forEach((cat) => {
    plantCounts[cat.name] =
      cat.slug === 'all-plants'
        ? plants.length
        : plants.filter((plant) => plant.category === cat.name).length;
  });

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
              <span className="mx-1" />
              <span className="text-gray-600">{selectedCategory.name} Identifier</span>
            </div>
            <p className="mt-3 md:text-3xl text-2xl font-extrabold text-left w-full py-4">
              {selectedCategory.title || <Skeleton width={200} />}
            </p>
            <p className="text-sm xl:max-w-[760px] lg:max-w-[640px] md:max-w-[520px]">
              {selectedCategory.description || <Skeleton count={3} />}
            </p>
            <div className="mt-4 flex items-center">
              <input
                type="text"
                className="relative flex items-center gap-2 md:h-14 h-12 w-full md:w-[400px] lg:w-[500px] bg-white rounded-2xl px-4 text-16 mr-2"
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
        <div className="w-[45%] h-full">
          {selectedCategory.headerImage ? (
            <img
              src={selectedCategory.headerImage}
              alt={`${selectedCategory.name} Illustration`}
              className="w-full h-[70%] object-contain"
            />
          ) : (
            <Skeleton height="100%" />
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row">
          <PlantIdentifierWrapper
            initialSelectedCategory={selectedCategory}
            initialDisplayedPlants={displayedPlants}
            initialCategories={categories}
            initialPlantCounts={plantCounts}
            initialMainDescription={selectedCategory.mainDescription}
            initialExpandedDescription={selectedCategory.expandedDescription}
          />
        </div>
      </div>
    </div>
  );
}