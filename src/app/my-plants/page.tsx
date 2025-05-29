// File: app/my-plants/page.tsx
import { Suspense } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Plant } from '../../../types/plant'; // Adjust path if needed
import { getServerSession } from 'next-auth/next';
import { authOptions, CustomSession } from '../lib/auth'; // Import CustomSession
import PlantSearch from './PlantSearch'; // Make sure this component exists

// Modified getSavedPlants to accept a token
async function getSavedPlantsWithToken(apiToken: string | undefined): Promise<Plant[]> {
  if (!apiToken) {
    console.log('No API token provided to getSavedPlantsWithToken.');
    return [];
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const url = `${baseUrl}/api/plant/saved`;

  console.log(`Fetching saved plants from: ${url} using Authorization header.`);

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Failed to fetch saved plants: ${res.status} ${res.statusText}. URL: ${url}. Body: ${errorBody}`);
      if (res.status === 401 || res.status === 403) {
          console.warn("Auth error fetching saved plants. Token might be invalid/expired.");
      }
      return [];
    }

    const data = await res.json();
    if (!data || !Array.isArray(data.plants)) {
      console.error('Invalid response structure for saved plants:', data);
      return [];
    }
    return data.plants as Plant[];
  } catch (error) {
    console.error('Error fetching saved plants in getSavedPlantsWithToken function:', error);
    return [];
  }
}

export default async function MyPlantsPage() { // Renamed for clarity if it's different from SavedPlantsPage
  const session = await getServerSession(authOptions) as CustomSession | null; // Use imported CustomSession

  if (!session || !session.user || !session.user.id || !session.apiAccessToken) {
    let message = "Please log in to view your plants.";
    if (session && session.user && session.user.id && !session.apiAccessToken) {
        message = "Session active, but API access token is missing. Please try logging out and back in.";
        console.warn("User logged in but apiAccessToken is missing from session object.");
    } else if (!session || !session.user) {
        console.log("No active session or user in session.");
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header
          className="w-full shadow-md p-6"
          style={{ background: 'linear-gradient(90deg, #DDF9D5, #BEFFE4)' }}
        >
          <div className="container mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800">Your Plants</h1>
          </div>
        </header>
        <main className="container mx-auto py-12 flex-grow flex items-center justify-center">
          <p className="text-gray-600 text-center text-lg">{message}</p>
        </main>
      </div>
    );
  }

  const plants = await getSavedPlantsWithToken(session.apiAccessToken);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full shadow-md p-6" style={{ background: 'linear-gradient(90deg, #DDF9D5, #BEFFE4)' }}>
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
    }>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full shadow-md p-6" style={{ background: 'linear-gradient(90deg, #DDF9D5, #BEFFE4)' }}>
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
              You haven’t added any plants yet.
            </p>
          ) : (
            <PlantSearch plants={plants} />
          )}
        </main>
      </div>
    </Suspense>
  );
}