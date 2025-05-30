import { Suspense } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Plant } from '../../../types/plant';
import { getServerSession } from 'next-auth/next';
import { authOptions, CustomSession } from '../lib/auth';
import PlantSearch from './PlantSearch';

async function getSavedPlantsWithToken(apiToken: string | undefined): Promise<Plant[]> {
  if (!apiToken) return [];

  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/plant/saved`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch saved plants: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data.plants) ? data.plants : [];
  } catch (error) {
    console.error('Error fetching saved plants:', error);
    return [];
  }
}

export default async function MyPlantsPage() {
  const session = (await getServerSession(authOptions)) as CustomSession | null;

  if (!session || !session.apiAccessToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header
          className="w-full shadow-md p-6"
          style={{ background: 'linear-gradient(90deg, #DDF9D5, #BEFFE4)' }}
        >
          <h1 className="text-3xl font-bold text-gray-800 text-center">Your Plants</h1>
        </header>
        <main className="container mx-auto py-12 flex-grow flex items-center justify-center">
          <p className="text-gray-600 text-center text-lg">Please log in to view your plants.</p>
        </main>
      </div>
    );
  }

  const plants = await getSavedPlantsWithToken(session.apiAccessToken);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <header
            className="w-full shadow-md p-6"
            style={{ background: 'linear-gradient(90deg, #DDF9D5, #BEFFE4)' }}
          >
            <div className="container mx-auto text-center">
              <h1 className="text-3xl font-bold text-gray-800">Your Plants</h1>
              <p className="mt-2 text-lg text-gray-600">Loading your plants...</p>
            </div>
          </header>
          <main className="container mx-auto p-6 flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-4">
                  <Skeleton height={160} className="mb-4" />
                  <Skeleton count={1} width="80%" className="mb-2" />
                  <Skeleton count={1} width="60%" />
                </div>
              ))}
            </div>
          </main>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header
          className="w-full shadow-md p-6"
          style={{ background: 'linear-gradient(90deg, #DDF9D5, #BEFFE4)' }}
        >
          <div className="container mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800">Your Plants</h1>
            <p className="mt-2 text-lg text-gray-600">
              View and manage your {plants.length > 0 ? `${plants.length} ` : ''} plant{plants.length !== 1 ? 's' : ''}.
            </p>
          </div>
        </header>
        <main className="container mx-auto p-6 flex-grow">
          {plants.length === 0 ? (
            <p className="text-gray-600 text-center mt-12 text-lg">
              You haven’t added any plants yet.{' '}
              <a href="/identify/all-plants" className="text-emerald-500 hover:underline">
                Browse plants to add some!
              </a>
            </p>
          ) : (
            <PlantSearch plants={plants} />
          )}
        </main>
      </div>
    </Suspense>
  );
}