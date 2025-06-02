// File: app/my-plants/page.tsx
import { Suspense } from 'react';
// import Skeleton from 'react-loading-skeleton'; // Not used in the provided snippet, but keep if you use it
// import 'react-loading-skeleton/dist/skeleton.css';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth"; // Adjust path if needed
import { Plant } from '../../../types/plant'; // Adjust path
import PlantSearch from './PlantSearch'; // Adjust path

async function getSavedPlantsByUserId(userId: string | undefined): Promise<Plant[]> {
  if (!userId) {
    console.log('[MyPlantsPage] getSavedPlantsByUserId called with no userId. Returning empty array.');
    return [];
  }
  console.log(`[MyPlantsPage] Fetching plants for userId: ${userId}`);

  // Determine baseUrl carefully
  const envAppUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  // Ensure no trailing slash for consistency, then add the API path
  const base = envAppUrl ? envAppUrl.replace(/\/$/, '') : 'http://localhost:3000';
  const url = `${base}/api/plant/saved?userId=${encodeURIComponent(userId)}`;

  console.log(`[MyPlantsPage] Attempting to fetch from API URL: ${url}`);

  try {
    const res = await fetch(url, {
      cache: 'no-store', // Essential for dynamic data that can change
      headers: {
        'Content-Type': 'application/json',
      },
      // In Node.js 18+, keepAlive can be beneficial for repeated calls to the same host,
      // but for a single call like this, it's less critical.
      // next: { revalidate: 0 } // Another way to ensure no caching for App Router fetch
    });

    if (!res.ok) {
      const errorBody = await res.text(); // Attempt to get text body for more info
      console.error(`[MyPlantsPage] API request to ${url} failed with status: ${res.status} ${res.statusText}. Response body: "${errorBody}"`);
      return [];
    }

    const data = await res.json();
    if (Array.isArray(data.plants)) {
      console.log(`[MyPlantsPage] Successfully fetched ${data.plants.length} plants for userId: ${userId} from ${url}`);
      return data.plants;
    } else {
      console.warn(`[MyPlantsPage] API response from ${url} was OK, but 'plants' array is missing or not an array. Received data:`, data);
      return [];
    }
  } catch (error: any) {
    console.error(`[MyPlantsPage] CRITICAL: The fetch call to ${url} itself threw an error:`, error);
    // Log additional details if available (e.g., error.cause in newer Node versions)
    if (error.cause) {
      console.error(`[MyPlantsPage] Fetch error cause:`, error.cause);
    }
    // This typically means the server at 'url' was unreachable (e.g., ECONNREFUSED, ENOTFOUND)
    // or there was a fundamental issue with the fetch operation.
    return [];
  }
}

export default async function MyPlantsPage() {
  const session = await getServerSession(authOptions);
  let userId: string | undefined = undefined;

  if (session?.user) {
    // Ensure you are extracting the ID correctly based on your NextAuth session callback
    userId = (session.user as any).id || (session.user as any)._id || (session.user as any).sub;
    console.log(`[MyPlantsPage] User ID from session: ${userId}`);
  } else {
    console.log("[MyPlantsPage] No active session or user found.");
  }

  if (!userId) {
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
  // This will now have more detailed logging if the fetch fails
  const plants = await getSavedPlantsByUserId(userId);

  return (
    <Suspense fallback={<div>Loading plants...</div>} /* Provide a meaningful fallback */ >
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
          {plants.length === 0 && userId ? (
            <p className="text-gray-600 text-center mt-12 text-lg">
              You haven’t added any plants yet.{' '}
              <a href="/identify/all-plants" className="text-emerald-500 hover:underline">
                Browse plants to add some!
              </a>
            </p>
          ) : plants.length > 0 ? ( // Only render PlantSearch if there are plants
            <PlantSearch plants={plants} />
          ) : null /* Or some other placeholder if plants is empty after fetch attempt for logged-in user */
          }
        </main>
      </div>
    </Suspense>
  );
}