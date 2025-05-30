'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
// Consider using next/image for optimized image loading
// import Image from 'next/image'; 

// Assuming these components exist and are correctly imported
import ImageLightbox from '../../components/ImageLightbox';
import PlantCareSection from '../../components/PlantCareSection';
import RelatedPlants from '../../components/RelatedPlants';
import PopularArticles from '../../components/PopularArticle';

// ... (Keep your interfaces: ImageFormat, Image, CareRequirement, CareSection, Plant)
interface ImageFormat {
  url: string;
  width: number;
  height: number;
}

interface CMSImage { // Renamed to avoid conflict with next/image if you use it
  id: number;
  name: string;
  url: string;
  formats: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
  caption: string;
  alternativeText: string;
  width: number;
  height: number;
}

interface CareRequirement {
  icon: string;
  label: string;
  value: string;
}

interface CareSection {
  title: string;
  icon: string;
  description: string;
}

interface Plant {
  _id: string;
  name: string;
  latin?: string;
  category: string;
  image: string;
  description: string;
  invitation?: string;
  fullDescription?: string;
  images: CMSImage[]; // Using renamed interface
  care?: Record<string, string>;
  careRequirements?: CareRequirement[];
  careSections?: CareSection[];
  funFact?: string;
  commonName?: string;
  slug?: string;
  toxicity?: string | null;
  difficulty?: string;
  humidity?: string;
  detailId?: string | null;
}


// ... (Keep your Icon components: ShareIcon, BookmarkCheckIcon, HeartIcon)
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6 text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.004 9.414l-2.122 2.121C13.322 12.095 12.726 12.5 12 12.5H4M16.004 9.414L20 13.001M16.004 9.414L12.414 5.828" />
  </svg>
);

const BookmarkCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-teal-500">
    <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93zM12 15.75l6 3V5.507c0-.806-.486-1.517-1.29-1.764a47.742 47.742 0 00-9.42 0C6.486 3.99 6 4.701 6 5.507V18.75l6-3z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M16.704 9.296a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 111.06-1.06L11 14.94l4.72-4.72a.75.75 0 011.06 0z" clipRule="evenodd" />
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);


export default function PlantsDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const [allPlants, setAllPlants] = useState<Plant[]>([]);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        console.warn('No ID found in params, redirecting.');
        router.replace('/identify/all-plants');
        return;
      }

      if (status === 'loading') {
        // console.log('Session loading, waiting...');
        return; // Wait for session to be loaded
      }
      
      if (status === 'unauthenticated') {
        setError('You need to be logged in to view plant details.');
        setLoading(false);
        return;
      }

      // Ensure session and token are available before proceeding
      if (!session?.apiAccessToken) {
          setError('Authentication token missing. Please log in again.');
          setLoading(false);
          return;
      }
      const token = session.apiAccessToken;

      setLoading(true);
      setError(null);

      try {
        // Fetch plant details and all plants in parallel
        const [detailResponse, plantsResponse] = await Promise.all([
          fetch(`/api/plants/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch('/api/plants', { // OPTIMIZATION: Consider if ALL plants are truly needed here.
                                 // If RelatedPlants can work with a smaller/smarter subset,
                                 // modify this fetch or use a different endpoint.
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        // Process plant detail response
        if (!detailResponse.ok) {
          if (detailResponse.status === 404) {
            setError('Plant not found. Please check the ID or try another plant.');
          } else if (detailResponse.status === 401 || detailResponse.status === 403) {
            setError('Authentication failed for plant details. Please log in again.');
          } else {
            const errorData = await detailResponse.json().catch(() => ({ message: `Failed to fetch plant details: ${detailResponse.status}` }));
            throw new Error(errorData.message || `Failed to fetch plant details: ${detailResponse.status}`);
          }
          setPlant(null); // Explicitly set plant to null on error
        } else {
          const plantData = await detailResponse.json();
          setPlant(plantData);
        }

        // Process all plants response
        if (!plantsResponse.ok) {
          console.error('Failed to fetch all plants:', plantsResponse.status, await plantsResponse.text());
          // Decide if this is a critical error. For now, we'll let the page load without allPlants if it fails.
          // setError(prevError => prevError ? `${prevError} Also failed to fetch all plants.` : 'Failed to fetch all plants.');
          setAllPlants([]); // Set to empty array or handle error appropriately
        } else {
          const { plants } = await plantsResponse.json();
          setAllPlants(plants || []);
        }

      } catch (err: any) {
        console.error('Error fetching plant data:', err);
        setError(err.message || 'An unexpected error occurred.');
        setPlant(null); // Ensure plant is null on catch-all error
        setAllPlants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router, session, status]); // Add session to dependency array as its properties are used

  // ... (Keep the loading/error/!plant conditional rendering logic)
  if (loading || (status === 'loading' && !plant && !error)) { // Show skeleton while session is loading too if no plant/error yet
    return (
      <div className="flex flex-col min-h-screen p-4 md:p-6">
        <div className="max-w-4xl mx-auto w-full">
          <Skeleton height={300} width="100%" className="rounded-lg mb-6" />
          <Skeleton height={40} width="60%" className="mb-4" />
          <Skeleton count={3} height={20} className="mb-2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {Array(4)
              .fill(null)
              .map((_, index) => (
                <Skeleton key={index} height={100} className="rounded-md" />
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen p-4 md:p-6">
        <div className="max-w-4xl mx-auto w-full mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
          <button
            onClick={() => router.push('/identify/all-plants')}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
          >
            Go to All Plants
          </button>
        </div>
      </div>
    );
  }

  if (!plant) {
     // This case might be hit if loading finished but plant is still null without an error being set.
     // Or if redirected by missing id.
    return (
      <div className="flex flex-col min-h-screen p-4 md:p-6">
        <div className="max-w-4xl mx-auto w-full text-center">
          <p>Plant data could not be loaded. You might be redirected.</p>
           <Skeleton height={300} width="100%" className="rounded-lg mb-6" />
        </div>
      </div>
    );
  }


  let imagesToDisplay: string[] = [];
  if (plant.images && plant.images.length > 0) {
    // Prioritize 'medium' or 'large' format if available for display, fallback to main url
    imagesToDisplay = plant.images.map((img) => 
        img.formats?.medium?.url || img.formats?.large?.url || img.url
    );
  } else if (plant.image) {
    imagesToDisplay = [plant.image];
  }

  const handleImageClick = (index: number) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  };

  const scientificName = plant.latin || plant.commonName || plant.description.substring(0, 50) + (plant.description.length > 50 ? '...' : '');


  return (
    <div className="bg-white min-h-screen p-4 md:p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4 md:mb-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {plant.name}{plant.name.toLowerCase().includes('care') ? '' : ' Care'}
            </h1>
            <p className="text-sm text-gray-500 md:italic">{scientificName}</p>
          </div>
          <button className="text-gray-600 hover:text-gray-800 md:hidden" aria-label="Share plant details">
            <ShareIcon />
          </button>
          <button
            onClick={() => router.push(`/care-plan/${id}`)}
            className="hidden md:block bg-emerald-400 text-white px-4 py-2 rounded-full hover:bg-emerald-500"
          >
            Get Care Plan
          </button>
        </div>
        <button
          onClick={() => router.push(`/care-plan/${id}`)}
          className="mt-1 w-full bg-teal-500 text-white py-3 rounded-[28px] text-base font-semibold md:hidden"
        >
          View Care Plan
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {imagesToDisplay.length > 0 ? (
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            {/* Mobile Image Layout */}
            <div className="flex gap-2 md:hidden">
              {imagesToDisplay[0] && (
                // TODO: Consider using <Image /> from next/image for optimization
                // Example: <Image src={imagesToDisplay[0]} alt={`${plant.name} 1`} width={...} height={...} className="..." />
                <img
                  src={imagesToDisplay[0]}
                  alt={`${plant.name} 1`}
                  className="w-2/3 h-auto object-cover rounded-xl shadow-md cursor-pointer"
                  style={{ maxHeight: '330px' }}
                  onClick={() => handleImageClick(0)}
                  loading="lazy" // Add lazy loading
                />
              )}
              {imagesToDisplay.length > 1 && (
                <div className="w-1/3 flex flex-col gap-2" style={{ maxHeight: '330px' }}>
                  {imagesToDisplay[1] && (
                    <img
                      src={imagesToDisplay[1]}
                      alt={`${plant.name} 2`}
                      className="w-full h-[calc(50%-0.25rem)] object-cover rounded-xl shadow-md cursor-pointer"
                      onClick={() => handleImageClick(1)}
                      loading="lazy"
                    />
                  )}
                  {imagesToDisplay[2] && (
                    <img
                      src={imagesToDisplay[2]}
                      alt={`${plant.name} 3`}
                      className="w-full h-[calc(50%-0.25rem)] object-cover rounded-xl shadow-md cursor-pointer"
                      onClick={() => handleImageClick(2)}
                      loading="lazy"
                    />
                  )}
                </div>
              )}
            </div>
            {/* Desktop Image Layout */}
            <div className="hidden md:grid md:grid-cols-2 md:grid-rows-2 md:gap-4">
              {imagesToDisplay.slice(0, 4).map((src, idx) => (
                // TODO: Consider using <Image /> from next/image
                <img
                  key={`desktop-${idx}`}
                  src={src}
                  alt={`${plant.name} ${idx + 1} (desktop)`}
                  className={`w-full object-cover rounded-lg shadow-md cursor-pointer
                              ${idx === 0 ? 'md:row-span-2 h-full' : 'h-40 md:h-auto'}
                              ${idx === 0 && imagesToDisplay.length === 1 ? 'md:col-span-2' : ''}
                              ${idx > 0 ? 'aspect-video md:aspect-auto' : ''}`}
                  style={idx === 0 ? {} : { aspectRatio: imagesToDisplay.length > 2 && idx === 1 ? '1 / 1' : undefined }}
                  onClick={() => handleImageClick(idx)}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <Skeleton height={330} className="rounded-xl shadow-md" />
          </div>
        )}

        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <div>
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <h2 className="text-xl md:text-2xl font-bold md:font-semibold text-gray-900">What is the plant</h2>
              <div className="flex items-center gap-3 md:gap-4">
                <button aria-label="Bookmark plant">
                  <BookmarkCheckIcon />
                </button>
                <button aria-label="Add to favorites">
                  <HeartIcon />
                </button>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {plant.invitation && <span className="block mb-2 italic">{plant.invitation}</span>}
              {plant.fullDescription || plant.description || 'Detailed description not available.'}
            </p>
            {plant.funFact && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                <h3 className="text-md font-semibold text-emerald-700">Fun Fact!</h3>
                <p className="text-sm text-gray-600">{plant.funFact}</p>
              </div>
            )}
            <p className="mt-4 text-sm text-gray-600">
              If you’ve recognized any mistakes, feel free to notify us. This helps us maintain quality.
            </p>
          </div>

          {plant.careRequirements && plant.careRequirements.length > 0 && (
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Care Requirements</h2>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                {plant.careRequirements.map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center">
                    {/* TODO: Consider using <Image /> from next/image for icons if they are external URLs */}
                    <img src={icon} alt={`${label} icon`} className="w-12 h-12" />
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Care for the Plant</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <PlantCareSection plant={plant} careSections={plant.careSections} />
            <div className="sticky top-24 py-4 px-2 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-4">
                 {/* TODO: Consider using <Image /> from next/image */}
                <img
                  src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fbanner_disease_diagnosis_ac2a80a8a8.webp&w=384&q=75"
                  alt="Plant illustration"
                  className="w-[180px] h-[200px] object-cover"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Disease diagnosis</h3>
                  <p className="text-gray-600">Check your plant’s health</p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/identify/${id}/diagnose`)}
                className="mt-4 px-5 py-2 border border-emerald-500 text-emerald-500 rounded-full hover:bg-emerald-100"
              >
                Diagnose my Plant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pass only necessary props to RelatedPlants or optimize its data fetching */}
      <RelatedPlants id={id} allPlants={allPlants} currentPlantCategory={plant.category} />
      <PopularArticles />

      {lightboxOpen && imagesToDisplay.length > 0 && (
        <ImageLightbox images={imagesToDisplay} startIndex={photoIndex} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}