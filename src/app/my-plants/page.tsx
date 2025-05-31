// File: app/my-plants/page.tsx
import { Suspense } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth"; // Adjust path if needed
import { Plant } from '../../../types/plant'; // Adjust path
import PlantSearch from './PlantSearch'; // Adjust path

async function getSavedPlantsByUserId(userId: string | undefined): Promise<Plant[]> {
  if (!userId) {
    console.log('[MyPlantsPage] getSavedPlantsByUserId called with no userId.');
    return [];
  }
  console.log(`[MyPlantsPage] Fetching plants for userId: ${userId}`);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/plant/saved?userId=${encodeURIComponent(userId)}`; // Pass userId as query param
  console.log(`[MyPlantsPage] Calling API URL: ${url}`);

  try {
    // IMPORTANT: Ensure NO Authorization header is being sent from here
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        // DO NOT ADD 'Authorization' header here if the API doesn't expect it
      },
    });

    if (!res.ok) {
      const errorBody = await res.text(); // Get the error response body
      console.error(`[MyPlantsPage] Failed to fetch saved plants: ${res.status} ${res.statusText} "${errorBody}"`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data.plants) ? data.plants : [];
  } catch (error) {
    console.error('[MyPlantsPage] Error in getSavedPlantsByUserId fetch:', error);
    return [];
  }
}

export default async function MyPlantsPage() {
  const session = await getServerSession(authOptions);
  let userId: string | undefined = undefined;

  if (session?.user) {
    userId = (session.user as any).id; // Assuming 'id' is on session.user from your NextAuth callbacks
                                      // Or (session as any).userId if you put it there
    console.log(`[MyPlantsPage] User ID from session: ${userId}`);
  } else {
    console.log("[MyPlantsPage] No active session or user found.");
  }

  if (!userId) {
    // User is not logged in according to NextAuth
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header
          className="w-full shadow-md p-6"
          style={{ background: 'linear-gradient(90deg, #DDF9D5, #BEFFE4)' }}
        >
          <h1 className="text-3xl font-bold text-gray-800 text-center">Your Plants</h1>
        </header>
        <main className="container mx-auto py-12 flex-grow flex items-center justify-center">
          <p className="text-gray-600 text-center text-lg">
            Please log in to view your plants.
          </p>
        </main>
      </div>
    );
  }

  // If userId is present, fetch plants
  const plants = await getSavedPlantsByUserId(userId);

  return (
    <Suspense /* ... fallback ... */ >
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
          {plants.length === 0 && userId ? ( // Check userId to distinguish "no plants" from "not logged in"
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