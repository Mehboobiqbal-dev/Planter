'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Category, Plant } from '../../../types/plant';

// Dynamically import the PlantIdentifierClient component
const PlantIdentifierClient = dynamic(() => import('./PlantIdentifierClient'), {
  ssr: false, // Disable server-side rendering for client-only component
});

interface PlantIdentifierWrapperProps {
  initialSelectedCategory: Category;
  initialDisplayedPlants: Plant[];
  initialCategories: Category[];
  initialPlantCounts: { [key: string]: number };
  initialMainDescription: string;
  initialExpandedDescription: string;
}

export default function PlantIdentifierWrapper({
  initialSelectedCategory,
  initialDisplayedPlants,
  initialCategories,
  initialPlantCounts,
  initialMainDescription,
  initialExpandedDescription,
}: PlantIdentifierWrapperProps) {
  return (
    <Suspense fallback={null}>
      <PlantIdentifierClient
        initialSelectedCategory={initialSelectedCategory}
        initialDisplayedPlants={initialDisplayedPlants}
        initialCategories={initialCategories}
        initialPlantCounts={initialPlantCounts}
        initialMainDescription={initialMainDescription}
        initialExpandedDescription={initialExpandedDescription}
      />
    </Suspense>
  );
}