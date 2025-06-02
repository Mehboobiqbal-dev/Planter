// src/app/plants/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // Import useSession
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ClipLoader } from 'react-spinners'; // For loading indicator on button

import ImageLightbox from '../../components/ImageLightbox';
import PlantCareSection from '../../components/PlantCareSection';
import RelatedPlants from '../../components/RelatedPlants';
import PopularArticles from '../../components/PopularArticle';

import { Plant, Image as PlantImage } from '../../../../types/plant';

// --- SVG Icons ---
const ShareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2.5"
    stroke="currentColor"
    className="w-6 h-6 text-gray-500"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.05.588.05h5.506c.198 0 .393-.025.588-.05M11.25 12.25v6.75a2.25 2.25 0 002.25 2.25h.375c.621 0 1.125-.504 1.125-1.125V12.25m0 0A2.25 2.25 0 0013.5 10h.375c.621 0 1.125.504 1.125 1.125v.006M11.25 12.25a2.25 2.25 0 01-2.25-2.25V10c0-.621.504-1.125 1.125-1.125h.375A2.25 2.25 0 0113.5 10v.006m0 0M11.25 12.25v-6.75a2.25 2.25 0 00-2.25-2.25H8.625c-.621 0-1.125.504-1.125 1.125v6.75M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c-.195.025-.39.05-.588.05H4.125c-.198 0-.393-.025-.588-.05M11.25 12.25A2.25 2.25 0 0113.5 10h.375c.621 0 1.125.504 1.125 1.125v.006"
    />
  </svg>
);

const BookmarkIconOutline = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400 hover:text-teal-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
  </svg>
);

const BookmarkIconSolid = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-8 h-8 text-teal-500"
  >
    <path
      fillRule="evenodd"
      d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93zM12 15.75l6 3V5.507c0-.806-.486-1.517-1.29-1.764a47.742 47.742 0 00-9.42 0C6.486 3.99 6 4.701 6 5.507V18.75l6-3z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M16.704 9.296a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 111.06-1.06L11 14.94l4.72-4.72a.75.75 0 011.06 0z"
      clipRule="evenodd"
    />
  </svg>
);

const HeartIconOutline = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
    className="w-8 h-8 text-gray-400 hover:text-red-500"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
    />
  </svg>
);

const HeartIconSolid = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-8 h-8 text-red-500"
  >
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383-.218l-.022.012-.007.004-.004.001a.752.752 0 01-.704 0l-.004-.001z" />
  </svg>
);
// --- End SVG Icons ---


export default function PlantsDetailClientPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const idFromParams = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPlants, setRelatedPlants] = useState<Plant[]>([]);
  const [isLoadingRelatedPlants, setIsLoadingRelatedPlants] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);


  useEffect(() => {
    if (!idFromParams) {
      console.warn('No plant ID → (initial check)');
      setLoading(false);
      setIsLoadingRelatedPlants(false);
      return;
    }

    const fetchPlant = async () => {
      setLoading(true);
      setIsLoadingRelatedPlants(true); 
      setError(null);
      setPlant(null); // Reset plant state before fetching new one
      try {
        const detailRes = await fetch(`/api/plants/${idFromParams}`);
        if (!detailRes.ok) {
          const text = await detailRes.text();
          console.error(`Error fetching plant detail: ${detailRes.status} – ${text}`);
          if (detailRes.status === 404) {
            setError(`Plant "${idFromParams}" not found.`);
          } else {
            let parsedError = { message: `Server responded ${detailRes.status}` };
            try { parsedError = JSON.parse(text); } catch {}
            throw new Error(parsedError.message || detailRes.statusText);
          }
          // setLoading(false) and setIsLoadingRelatedPlants(false) will be handled by the error state or subsequent useEffect
          return;
        }
        const data: Plant = await detailRes.json();
        setPlant(data);
      } catch (err: any) {
        console.error('fetchPlant error:', err);
        setError(err.message || 'Unexpected error loading plant.');
        // setLoading(false) and setIsLoadingRelatedPlants(false) will be handled by the error state or subsequent useEffect
      }
      // setLoading(false) is deferred to the next useEffect that handles dependent fetches
    };

    fetchPlant();
  }, [idFromParams]);


  useEffect(() => {
    if (!baseUrl) return; 

    if (error) { // If an error occurred fetching the plant, stop all loading
        if (loading) setLoading(false);
        if (isLoadingRelatedPlants) setIsLoadingRelatedPlants(false);
        return;
    }

    if (!plant || !plant._id) {
        // If no plant data (e.g., invalid ID not caught by error, or initial state before fetchPlant completes)
        // and not already in an error state, keep loading states as they are or turn off if appropriate.
        // If fetchPlant is still running, `loading` will be true. If it completed with no plant, it might turn loading off.
        if (idFromParams && !error && loading) { // If an ID exists, no error, but plant is null and still "loading"
            // This implies fetchPlant hasn't set plant yet, or set it to null successfully
            // We wait for fetchPlant to complete or error out.
            // If fetchPlant finished and set plant to null (and no error), then other logic handles it.
        } else { // No ID, or error already handled, or fetchPlant finished setting plant (or not)
            if(loading) setLoading(false);
            if(isLoadingRelatedPlants) setIsLoadingRelatedPlants(false);
        }
        return;
    }
    
    if (sessionStatus === 'loading') {
        return;
    }

    const fetchInitialStatusAndRelated = async () => {
        setIsLoadingRelatedPlants(true); // Explicitly set for this operation

        if (sessionStatus === 'authenticated' && session?.user && plant?._id) {
            const userId = (session.user as any)?.id || (session.user as any)?.sub;
            if (userId) {
                try {
                    // Reset favorite/bookmark status for the new plant
                    setIsFavorited(false);
                    setIsBookmarked(false);
                    const savedRes = await fetch(`${baseUrl}/api/plant/saved?userId=${encodeURIComponent(String(userId))}`);
                    if (savedRes.ok) {
                        const savedData = await savedRes.json();
                        if (savedData.plants && Array.isArray(savedData.plants)) {
                            const isFav = savedData.plants.some((p: Plant) => p._id === plant._id);
                            setIsFavorited(isFav);
                            setIsBookmarked(isFav); 
                        }
                    } else {
                        console.warn('Failed to fetch initial saved status:', await savedRes.text());
                    }
                } catch (err) {
                    console.error('Error fetching initial saved status:', err);
                }
            }
        } else {
             // If not authenticated, ensure states are reset
            setIsFavorited(false);
            setIsBookmarked(false);
        }

        try {
            setRelatedPlants([]); // Clear previous related plants
            const relatedUrl = `/api/related?category=${encodeURIComponent(plant.category)}&excludeId=${plant._id}&limit=4`;
            const relatedRes = await fetch(relatedUrl);
            if (relatedRes.ok) {
                const relatedArr: Plant[] = await relatedRes.json();
                setRelatedPlants(relatedArr);
            } else {
                console.warn('Failed to fetch related plants:', await relatedRes.text());
            }
        } catch (err) {
            console.error('fetchRelated error:', err);
        } finally {
            setIsLoadingRelatedPlants(false);
        }
        setLoading(false); 
    };

    fetchInitialStatusAndRelated();

  }, [plant, sessionStatus, session, baseUrl, idFromParams, error]); // Added session, idFromParams, error

  const handleToggleFavorite = async () => {
    if (sessionStatus !== 'authenticated' || !session?.user || !plant) {
      alert('Please log in to save plants.');
      return;
    }
    const userId = (session.user as any)?.id || (session.user as any)?.sub;
    if (!userId) {
      alert('User ID not found. Cannot save.');
      return;
    }

    setSavingFavorite(true);
    const endpoint = isFavorited ? `${baseUrl}/api/plant/unsave` : `${baseUrl}/api/plant/save`;
    const plantId = plant._id;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(userId), plantId }),
      });

      if (res.ok) {
        setIsFavorited(!isFavorited);
        // If bookmark is tied to favorite, update it too
        // setIsBookmarked(!isBookmarked); // This line was causing issues, handleToggleBookmark manages its own state
      } else {
        const errorData = await res.json();
        alert(`Failed to ${isFavorited ? 'unsave' : 'save'} plant: ${errorData.error || 'Unknown error'}`);
        console.error('Error toggling favorite:', errorData);
      }
    } catch (err) {
      alert(`An error occurred. Please try again.`);
      console.error('Network error toggling favorite:', err);
    } finally {
      setSavingFavorite(false);
    }
  };

  const handleToggleBookmark = async () => {
     if (sessionStatus !== 'authenticated' || !session?.user || !plant) {
      alert('Please log in to bookmark plants.');
      return;
    }
    const userId = (session.user as any)?.id || (session.user as any)?.sub;
    if (!userId) {
      alert('User ID not found. Cannot bookmark.');
      return;
    }
    
    setSavingBookmark(true);
    // Assuming bookmark uses same/similar mechanism as favorite for this example
    // Replace with actual bookmark API call if different
    const endpoint = isBookmarked ? `${baseUrl}/api/plant/unsave` : `${baseUrl}/api/plant/save`; // Example: uses same endpoints
    const plantId = plant._id;

    try {
      const res = await fetch(endpoint, { // This should be specific bookmark API if different
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(userId), plantId }), // Or { userId, plantId, type: 'bookmark' }
      });

      if (res.ok) {
        setIsBookmarked(!isBookmarked);
         // If favoriting is also tied, update it. For now, assume they are separate actions but can use same API
        if (isBookmarked === isFavorited) { // if they were in sync
             setIsFavorited(!isFavorited); // Keep them in sync for this example
        }
      } else {
        const errorData = await res.json();
        alert(`Failed to ${isBookmarked ? 'remove bookmark for' : 'bookmark'} plant: ${errorData.error || 'Unknown error'}`);
        console.error('Error toggling bookmark:', errorData);
      }
    } catch (err) {
      alert(`An error occurred while bookmarking. Please try again.`);
      console.error('Network error toggling bookmark:', err);
    } finally {
      setSavingBookmark(false);
    }
  };


  if (loading && !plant && !error) { 
    return (
      <div className="bg-white min-h-screen p-4 md:p-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4 md:mb-0">
            <div>
              <Skeleton width={250} height={30} className="mb-1 rounded" />
              <Skeleton width={150} height={20} className="rounded" />
            </div>
            <div className="hidden md:block">
              <Skeleton width={130} height={40} className="rounded-full" />
            </div>
          </div>
          <div className="md:hidden mt-1">
            <Skeleton width="100%" height={48} className="rounded-[28px]" />
          </div>
        </div>

        {/* Images + Description Skeleton */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <Skeleton height={320} className="rounded-xl" />
          </div>
          <div className="w-full md:w-2/3 flex flex-col gap-y-6">
            <div>
              <div className="flex justify-between items-center mb-2 md:mb-4">
                <Skeleton width={200} height={28} className="rounded" />
                <div className="flex items-center gap-3 md:gap-4">
                    <Skeleton circle height={32} width={32} />
                    <Skeleton circle height={32} width={32} />
                </div>
              </div>
              <Skeleton count={3} className="mb-2 rounded" />
              <Skeleton width="80%" className="mb-2 rounded" />
              <Skeleton width="90%" className="mb-3 rounded" />
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <Skeleton width={100} height={20} className="mb-1 rounded" />
                <Skeleton count={2} height={14} className="rounded" />
              </div>
               <Skeleton height={16} className="mt-4 rounded w-3/4" />
            </div>

            <div>
              <Skeleton width={180} height={28} className="mb-4 rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton circle height={40} width={40} className="mr-2"/>
                    <div className="flex-1">
                      <Skeleton width="70%" height={16} className="mb-1 rounded"/>
                      <Skeleton width="50%" height={16} className="rounded"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
            <Skeleton width={280} height={28} className="mb-6 rounded"/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <Skeleton height={280} className="rounded-lg"/>
                <div className="py-4 px-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-[100px] h-[120px] sm:w-[150px] sm:h-[170px]">
                        <Skeleton height="100%" className="rounded-md"/>
                    </div>
                    <div className="flex-1">
                      <Skeleton width="85%" height={20} className="mb-2 rounded" />
                      <Skeleton count={2} height={14} className="mb-1 rounded" />
                      <Skeleton width="65%" height={14} className="rounded" />
                    </div>
                  </div>
                  <Skeleton height={40} className="mt-4 rounded-full w-full sm:w-48" />
                </div>
            </div>
        </div>
        <RelatedPlants related={[]} currentPlantId={""} loading={true} />
        <div className="mt-10">
            <Skeleton width={220} height={28} className="mb-6 rounded"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} height={180} className="rounded-lg"/>)}
            </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-4 md:p-6 text-center">
            <h1 className="text-2xl font-semibold text-red-600 mb-3">Error Loading Plant</h1>
            <p className="text-gray-700 mb-4 text-lg">{error}</p>
            <button
                onClick={() => router.push('/identify/all-plants')}
                className="mt-2 bg-emerald-500 text-white px-6 py-3 rounded-full hover:bg-emerald-600 text-base font-semibold transition-colors"
            >
                Browse All Plants
            </button>
        </div>
    );
  }

  if (!idFromParams && !loading && !error) { 
    return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-4 md:p-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-700 mb-3">Invalid Plant ID</h1>
            <p className="text-gray-600 mb-4 text-lg">The plant ID is missing or invalid.</p>
            <button
                onClick={() => router.push('/identify/all-plants')}
                className="mt-2 bg-emerald-500 text-white px-6 py-3 rounded-full hover:bg-emerald-600 text-base font-semibold transition-colors"
            >
                Browse All Plants
            </button>
        </div>
    );
  }

  if (!plant && !loading) { // If not loading, no error, but plant is null (e.g. 404 not caught as error string)
    return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-4 md:p-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-700 mb-3">Plant Not Found</h1>
            <p className="text-gray-600 mb-4 text-lg">The requested plant could not be displayed. It might not exist or there was an issue fetching its details.</p>
            <button
                onClick={() => router.push('/identify/all-plants')}
                className="mt-2 bg-emerald-500 text-white px-6 py-3 rounded-full hover:bg-emerald-600 text-base font-semibold transition-colors"
            >
                Browse All Plants
            </button>
        </div>
    );
  }
  
  // Fallback for when plant is null but other conditions didn't catch it. This should ideally not be reached.
  if (!plant) return null;


  let imagesToDisplay: string[] = [];
  if (plant.images && plant.images.length > 0) {
    imagesToDisplay = plant.images.map((img: PlantImage) => img.url).filter((u) => !!u);
  } else if (plant.image) {
    imagesToDisplay = [plant.image];
  }

  const handleImageClick = (idx: number) => {
    setPhotoIndex(idx);
    setLightboxOpen(true);
  };
  const scientificName = plant.latin || plant.commonName || 'Details below';

  return (
    <div className="bg-white min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4 md:mb-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {plant.name}
              {!plant.name.toLowerCase().includes('care') ? ' Care' : ''}
            </h1>
            <p className="text-sm text-gray-500 md:italic">{scientificName}</p>
          </div>
          <button className="text-gray-600 hover:text-gray-800 md:hidden" aria-label="Share">
            <ShareIcon />
          </button>
          <button
            onClick={() => router.push(`/care-plan/${plant.slug || plant._id}`)}
            className="hidden md:block bg-emerald-400 text-white px-4 py-2 rounded-full hover:bg-emerald-500"
          >
            Get Care Plan
          </button>
        </div>
        <button
          onClick={() => router.push(`/care-plan/${plant.slug || plant._id}`)}
          className="mt-1 w-full bg-teal-500 text-white py-3 rounded-[28px] text-base font-semibold md:hidden"
        >
          View Care Plan
        </button>
      </div>

      {/* Images + Description */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Images */}
        <div className="w-full md:w-1/3 mb-6 md:mb-0">
           {imagesToDisplay.length > 0 ? (
            <>
              {/* Mobile */}
              <div className="flex gap-2 md:hidden">
                <img
                  src={imagesToDisplay[0]}
                  alt={`${plant.name} 1`}
                  className="w-2/3 h-auto object-cover rounded-xl shadow-md cursor-pointer"
                  style={{ maxHeight: '330px' }}
                  onClick={() => handleImageClick(0)}
                  onError={(e) => (e.currentTarget.src = '/images/default-plant.jpg')}
                  loading="lazy"
                />
                {imagesToDisplay.length > 1 && (
                  <div className="w-1/3 flex flex-col gap-2" style={{ maxHeight: '330px' }}>
                    {imagesToDisplay[1] && (
                      <img
                        src={imagesToDisplay[1]}
                        alt={`${plant.name} 2`}
                        className="w-full h-[calc(50%-0.25rem)] object-cover rounded-xl shadow-md cursor-pointer"
                        onClick={() => handleImageClick(1)}
                        onError={(e) => (e.currentTarget.src = '/images/default-plant.jpg')}
                        loading="lazy"
                      />
                    )}
                    {imagesToDisplay[2] && (
                      <img
                        src={imagesToDisplay[2]}
                        alt={`${plant.name} 3`}
                        className="w-full h-[calc(50%-0.25rem)] object-cover rounded-xl shadow-md cursor-pointer"
                        onClick={() => handleImageClick(2)}
                        onError={(e) => (e.currentTarget.src = '/images/default-plant.jpg')}
                        loading="lazy"
                      />
                    )}
                  </div>
                )}
              </div>
              {/* Desktop */}
              <div className="hidden md:grid md:grid-cols-2 md:grid-rows-2 md:gap-4">
                {imagesToDisplay.slice(0, 4).map((src, idx) => (
                  <img
                    key={`desktop-${idx}`}
                    src={src}
                    alt={`${plant.name} ${idx + 1} (desktop)`}
                    className={`
                      w-full object-cover rounded-lg shadow-md cursor-pointer
                      ${idx === 0 ? 'md:row-span-2 h-full' : 'md:h-full'}
                      ${idx === 0 && imagesToDisplay.length === 1 ? 'md:col-span-2' : ''}
                      ${idx === 0 ? '' : (imagesToDisplay.length > 2 && idx === 1 ? 'aspect-square' : '')}
                    `}
                    style={
                      idx === 0
                        ? { minHeight: '200px', maxHeight: '400px' } 
                        : { minHeight: '100px', maxHeight: '190px' } 
                    }
                    onClick={() => handleImageClick(idx)}
                    onError={(e) => (e.currentTarget.src = '/images/default-plant.jpg')}
                    loading="lazy"
                  />
                ))}
              </div>
            </>
          ) : (
            <img
              src="/images/default-plant.jpg"
              alt="Default plant"
              className="w-full h-auto object-cover rounded-xl shadow-md"
              style={{ maxHeight: '330px' }}
              loading="lazy"
            />
          )}
        </div>

        {/* Text + Care Requirements */}
        <div className="w-full md:w-2/3 flex flex-col gap-y-6">
          <div>
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <h2 className="text-xl md:text-2xl font-bold md:font-semibold text-gray-900">
                About the {plant.name}
              </h2>
              {sessionStatus === 'authenticated' && (
                  <div className="flex items-center gap-3 md:gap-4">
                    <button
                        onClick={handleToggleBookmark}
                        disabled={savingBookmark}
                        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark plant"}
                        title={isBookmarked ? "Remove bookmark" : "Bookmark plant"}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      {savingBookmark ? (
                        <ClipLoader size={28} color={isBookmarked ? "#0D9488" : "#6B7280"} />
                      ) : isBookmarked ? (
                        <BookmarkIconSolid />
                      ) : (
                        <BookmarkIconOutline />
                      )}
                    </button>
                    <button
                        onClick={handleToggleFavorite}
                        disabled={savingFavorite}
                        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                        title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      {savingFavorite ? (
                        <ClipLoader size={28} color={isFavorited ? "#EF4444" : "#6B7280"} />
                      ) : isFavorited ? (
                        <HeartIconSolid />
                      ) : (
                        <HeartIconOutline />
                      )}
                    </button>
                  </div>
              )}
              {sessionStatus === 'loading' && ( 
                <div className="flex items-center gap-3 md:gap-4">
                    <Skeleton circle height={32} width={32} />
                    <Skeleton circle height={32} width={32} />
                </div>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed">
              {plant.invitation && (
                <span className="block mb-2 italic">{plant.invitation}</span>
              )}
              {plant.fullDescription ||
                plant.description ||
                'Detailed description will be available soon.'}
            </p>
            {plant.funFact && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                <h3 className="text-md font-semibold text-emerald-700">Fun Fact!</h3>
                <p className="text-sm text-gray-600">{plant.funFact}</p>
              </div>
            )}
            <p className="mt-4 text-sm text-gray-600">
              If you spot any inaccuracies, please let us know. Your feedback helps us improve!
            </p>
          </div>

           {plant.careRequirements && plant.careRequirements.length > 0 && (
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                Care Requirements
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
                {plant.careRequirements.map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center">
                    {icon ? (
                      <img
                        src={icon}
                        alt={`${label} icon`}
                        className="w-10 h-10 md:w-12 md:h-12 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xl">
                        ?
                      </div>
                    )}
                    <div className="ml-2 flex flex-col">
                      <span className="text-gray-700 text-sm">{label}</span>
                      <span className="text-gray-700 text-sm font-medium">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {plant.careSections && plant.careSections.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            How to Care for Your {plant.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <PlantCareSection plant={plant} careSections={plant.careSections} />
            <div className="sticky top-24 py-4 px-3 bg-blue-50 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <img
                  src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fbanner_disease_diagnosis_ac2a80a8a8.webp&w=384&q=75"
                  alt="Plant health check"
                  className="w-[100px] h-[120px] sm:w-[150px] sm:h-[170px] object-contain rounded-md"
                  loading="lazy"
                />
                <div className="flex-1">
                  <h3 className="text-md sm:text-lg font-semibold text-gray-900">Plant Disease Diagnosis</h3>
                  <p className="text-gray-600 text-sm sm:text-base mt-1">
                    Worried about your plant? Let’s check its health.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/identify/${plant.slug || plant._id}/diagnose`)}
                className="mt-4 w-full sm:w-auto px-5 py-2.5 border border-emerald-500 text-emerald-500 rounded-full hover:bg-emerald-50 transition-colors font-medium"
              >
                Diagnose My Plant
              </button>
            </div>
          </div>
        </div>
      )}

      <RelatedPlants
        related={relatedPlants}
        currentPlantId={plant._id}
        loading={isLoadingRelatedPlants} 
      />
      <PopularArticles />

      {lightboxOpen && imagesToDisplay.length > 0 && (
        <ImageLightbox
          images={imagesToDisplay}
          startIndex={photoIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}