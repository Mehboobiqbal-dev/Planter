// src/app/components/RelatedPlants.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plant } from '../../../types/plant'; // Make sure this path is correct

export interface RelatedPlantsProps {
  id: string; // ID of the current plant, to exclude it
  allPlants: Plant[];
  currentPlantCategory: string; // Added this prop
}

const RelatedPlants: React.FC<RelatedPlantsProps> = ({ id, allPlants, currentPlantCategory }) => {
  const router = useRouter();

  // Filter by category first, then exclude the current plant, then slice
  const relatedInCategory = allPlants
    .filter(p => p.category === currentPlantCategory && p._id !== id);

  // If not enough in the same category, fill with other plants (excluding current)
  const otherPlants = allPlants.filter(p => p.category !== currentPlantCategory && p._id !== id);

  const plantsToDisplay = [
    ...relatedInCategory,
    ...otherPlants, // Add others if needed
  ]
  .slice(0, 4) // Take the top 4 overall unique plants
  .map((plant) => ({
    ...plant,
    latin: plant.latin || plant.commonName || 'Details unavailable', // Better fallback
  }));


  if (plantsToDisplay.length === 0 && allPlants.length > 1) {
    // Fallback if no related plants found but other plants exist (e.g. unique category)
    // Show some other random plants instead.
    const fallbackPlants = allPlants
      .filter(p => p._id !== id)
      .slice(0,4)
      .map((plant) => ({
        ...plant,
        latin: plant.latin || plant.commonName || 'Details unavailable',
      }));
      if (fallbackPlants.length > 0) {
        // Not ideal to set state or change plantsToDisplay here directly,
        // but for simplicity now. This logic could be improved.
        // For this example, let's log and proceed. Better approach would be another useEffect or memo.
        // console.warn("No plants in the same category, showing other random plants.");
        // plantsToDisplay = fallbackPlants; // This line has no effect if not re-rendered.
                                      // The initial plantsToDisplay will be used.
                                      // Better to do this logic right when defining plantsToDisplay
      }
  }


  return (
    <section className="mt-10 max-w-7xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Plants</h2>
      {plantsToDisplay.length > 0 ? (
        <div className="flex space-x-4 overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-4 sm:space-x-0 sm:gap-6">
          {plantsToDisplay.map((plant) => (
            <div
              key={plant._id}
              className="min-w-[250px] flex-none sm:flex-auto bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/identify/${plant.slug || plant._id}`)} // Prefer slug for routing
            >
              {/* Consider Next/Image here for optimization */}
              <img
                src={plant.image}
                alt={plant.name}
                className="w-full h-40 object-cover rounded-t-lg"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{plant.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{plant.latin}</p> {/* line-clamp for brevity */}
              </div>
            </div>
          ))}

          {/* Discover All Card */}
          <div className="min-w-[250px] flex-none sm:flex-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center"> {/* justify-center */}
            <img
              src="https://strapi.myplantin.com/twig_e3ab677a36.webp"
              alt="Branch icon"
              className="w-12 h-12 mb-4"
              loading="lazy"
            />
            <button
              onClick={() => router.push('/identify/all-plants')}
              className="mt-auto px-6 py-2 border border-emerald-500 text-emerald-500 rounded-full hover:bg-emerald-50 font-semibold"
            >
              Discover all
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">No related plants to show right now.</p>
      )}
    </section>
  );
};

export default RelatedPlants;