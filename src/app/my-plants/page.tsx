import { Suspense } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Plant } from '../../../types/plant';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../lib/auth';
import PlantSearch from './PlantSearch';

async function getSavedPlants(userId: string): Promise<Plant[]> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
  const url = `${baseUrl}/api/plant/saved?userId=${userId}`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error(`Failed to fetch saved plants: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    if (!data.plants || !Array.isArray(data.plants)) {
      console.error('Invalid response structure:', data);
      return [];
    }
    console.log('Fetched plants:', data.plants); // Debug log
    return data.plants as Plant[];
  } catch (error) {
    console.error('Error fetching saved plants:', error);
    return [];
  }
}

export default async function SavedPlantsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header
          className="w-full shadow-md p-6"
          style={{ background: 'linear-gradient(90deg, #DDF9D5, #BEFFE4)' }}
        >
          <div className="container mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800">Your Saved Plants</h1>
            <p className="mt-2 text-lg text-gray-600">
              Please log in to view your saved plants.
            </p>
          </div>
        </header>
        <main className="container mx-auto py-12">
          <p className="text-gray-600 text-center">
            Please log in to view your saved plants.
          </p>
        </main>
      </div>
    );
  }

  const userId = session.user.id;
  const plants = await getSavedPlants(userId);

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Skeleton count={5} />
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        <header
          className="w-full shadow-md p-6"
          style={{ background: 'linear-gradient(90deg, #DDF9D5, #BEFFE4)' }}
        >
          <div className="container mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800">Your Saved Plants</h1>
            <p className="mt-2 text-lg text-gray-600">
              View and manage your saved plants.
            </p>
          </div>
        </header>
        <main className="container mx-auto p-6">
          {plants.length === 0 ? (
            <p className="text-gray-600 text-center mt-12">
              You haven’t saved any plants yet.
            </p>
          ) : (
            <PlantSearch plants={plants} />
          )}
        </main>
      </div>
    </Suspense>
  );
}