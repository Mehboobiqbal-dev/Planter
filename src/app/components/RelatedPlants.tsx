'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plant } from '../../../types/plant'; // Adjust the path if needed

// Updated props: added loading?
export interface RelatedPlantsProps {
  related: Plant[];
  currentPlantId: string;
  loading?: boolean; // Add loading state prop
}

const RelatedPlants: React.FC<RelatedPlantsProps> = ({ related, currentPlantId, loading }) => {
  const router = useRouter();

  // If not loading and no related plants, render nothing.
  // This check is moved up to handle the non-loading empty state clearly.
  if (!loading && (!related || related.length === 0)) {
    return null;
  }

  const SkeletonCard: React.FC = () => (
    <div className="min-w-[200px] w-[200px] sm:min-w-0 sm:w-auto flex-none sm:flex-auto bg-white rounded-lg shadow-md">
      <div className="w-full h-40 bg-gray-300 animate-pulse rounded-t-lg"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-3 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <section className="mt-10 max-w-7xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Plants</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:space-x-0 sm:gap-6">
        {loading ? (
          <>
            {[...Array(4)].map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))}
          </>
        ) : (
          <>
            {/* Render actual related plants if not loading and related array is not empty */}
            {related && related.map((plant) => (
              <div
                key={plant._id}
                className="min-w-[200px] w-[200px] sm:min-w-0 sm:w-auto flex-none sm:flex-auto bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/plants/${plant.slug || plant._id}`)}
              >
                <img
                  src={plant.image}
                  alt={plant.name}
                  className="w-full h-40 object-cover rounded-t-lg"
                  loading="lazy"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = '/images/default-plant.jpg'
                    ;(e.target as HTMLImageElement).alt = 'Error loading image'
                  }}
                />
                <div className="p-4">
                  <h3
                    className="text-lg font-semibold text-gray-800 truncate"
                    title={plant.name}
                  >
                    {plant.name}
                  </h3>
                  <p
                    className="text-sm text-gray-600 line-clamp-2"
                    title={plant.latin}
                  >
                    {plant.latin}
                  </p>
                </div>
              </div>
            ))}

            {/* If fewer than 4 items and not loading, show a “Discover all” card */}
            {related && related.length < 4 && (
              <div className="min-w-[200px] w-[200px] sm:min-w-0 sm:w-auto flex-none sm:flex-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center">
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
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default RelatedPlants;