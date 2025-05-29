// src/components/PlantSearchWrapper.tsx
"use client";
import { useState, useEffect } from 'react';
import PlantIdentifierWrapper from './PlantIdentifierWrapper';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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

interface PlantSearchWrapperProps {
  initialPlants: Plant[];
  selectedCategory: Category;
  categories: Category[];
  plantCounts: { [key: string]: number };
}

export default function PlantSearchWrapper({
  initialPlants,
  selectedCategory,
  categories,
  plantCounts,
}: PlantSearchWrapperProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedPlants, setDisplayedPlants] = useState(initialPlants);
  const [recommendedPlants, setRecommendedPlants] = useState<Plant[]>([]);

  // Debugging: Log initialPlants to verify data
  useEffect(() => {
    console.log('Initial Plants:', initialPlants);
    setDisplayedPlants(initialPlants); // Reset displayed plants when initialPlants changes
  }, [initialPlants]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase().trim();
    setSearchTerm(term);

    // Filter plants based on search term
    const filteredPlants = term
      ? initialPlants.filter(
          (plant) =>
            plant.name.toLowerCase().includes(term) ||
            plant.latin?.toLowerCase().includes(term)
        )
      : initialPlants;

    setDisplayedPlants(filteredPlants);

    // Recommend plants (e.g., partial matches or related plants)
    const recommendations = initialPlants
      .filter(
        (plant) =>
          (plant.name.toLowerCase().startsWith(term) ||
            plant.latin?.toLowerCase().startsWith(term)) &&
          !filteredPlants.some((p) => p._id === plant._id) // Exclude exact matches
      )
      .slice(0, 3); // Limit to 3 recommendations

    setRecommendedPlants(recommendations);
  };

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
              <span className="text-gray-600">
                {selectedCategory?.name || 'Category'} Identifier
              </span>
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
                value={searchTerm}
                onChange={handleSearch}
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
        {/* Display search results */}
        {displayedPlants.length === 0 && searchTerm && (
          <div className="text-gray-500 p-4">
            No plants found matching "{searchTerm}".
          </div>
        )}
        {displayedPlants.length > 0 && (
          <div className="mb-4">
            
            <div className="flex flex-col md:flex-row">
              <PlantIdentifierWrapper
                key={selectedCategory._id + searchTerm} // Update key to force re-render on search
                initialSelectedCategory={selectedCategory}
                initialDisplayedPlants={displayedPlants}
                initialCategories={categories}
                initialPlantCounts={plantCounts}
                initialMainDescription={selectedCategory.mainDescription}
                initialExpandedDescription={selectedCategory.expandedDescription}
              />
            </div>
          </div>
        )}

        {/* Display recommendations */}
        {recommendedPlants.length > 0 && searchTerm && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Recommended Plants</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedPlants.map((plant) => (
                <div
                  key={plant._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                  <h3 className="text-md font-medium">{plant.name}</h3>
                  <p className="text-sm text-gray-600">{plant.latin}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}