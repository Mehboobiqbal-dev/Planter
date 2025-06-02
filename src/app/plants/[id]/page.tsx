// Ensure this path matches your project structure for the plant detail page
// e.g., src/app/plants/[id]/page.tsx or src/app/plant/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ClipLoader from 'react-spinners/ClipLoader';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ImageLightbox from '../../components/ImageLightbox'; // Adjust path
import PlantCareSection from '../../components/PlantCareSection'; // Adjust path
import RelatedPlants from '../../components/RelatedPlants'; // Uncomment if you use this
import PopularArticles from '../../components/PopularArticle'; // Adjust path
import { Plant, Image as PlantImage } from '../../../../types/plant'; // Adjust path to your types

// Icons (ensure these are correctly defined or imported)
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6 text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.05.588.05h5.506c.198 0 .393-.025.588-.05M11.25 12.25v6.75a2.25 2.25 0 002.25 2.25h.375c.621 0 1.125-.504 1.125-1.125V12.25m0 0A2.25 2.25 0 0013.5 10h.375c.621 0 1.125.504 1.125 1.125v.006M11.25 12.25a2.25 2.25 0 01-2.25-2.25V10c0-.621.504-1.125 1.125-1.125h.375A2.25 2.25 0 0113.5 10v.006m0 0M11.25 12.25v-6.75a2.25 2.25 0 00-2.25-2.25H8.625c-.621 0-1.125.504-1.125 1.125v6.75M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c-.195.025-.39.05-.588.05H4.125c-.198 0-.393-.025-.588-.05M11.25 12.25A2.25 2.25 0 0113.5 10h.375c.621 0 1.125.504 1.125 1.125v.006" />
  </svg>
);

const BookmarkCheckIcon = () => ( /* Your SVG */ <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-teal-500"><path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93zM12 15.75l6 3V5.507c0-.806-.486-1.517-1.29-1.764a47.742 47.742 0 00-9.42 0C6.486 3.99 6 4.701 6 5.507V18.75l6-3z" clipRule="evenodd" /><path fillRule="evenodd" d="M16.704 9.296a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 111.06-1.06L11 14.94l4.72-4.72a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>);
const HeartIcon = () => ( /* Your SVG */ <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>);


export default function PlantsDetailClientPage() {
  const params = useParams();
  const router = useRouter();

  // params.id can be string or string[]. Ensure it's a string.
  const idFromParams = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [allPlants, setAllPlants] = useState<Plant[]>([]); // For RelatedPlants if used
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!idFromParams) {
        console.warn('Plant detail page: No ID in params, redirecting.');
        router.replace('/identify/all-plants'); // Or your preferred fallback page
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null); // Reset error on new fetch
      console.log(`Fetching data for plant ID/slug: ${idFromParams}`);

      try {
        // Fetch single plant details
        const detailResponse = await fetch(`/api/plants/${idFromParams}`);
        console.log(`Detail response status for ${idFromParams}: ${detailResponse.status}`);

        if (!detailResponse.ok) {
          const errorText = await detailResponse.text(); // Get text for better debugging
          console.error(`Error fetching plant details for ${idFromParams}: ${detailResponse.status} - ${errorText}`);
          if (detailResponse.status === 404) {
            setError(`Plant with identifier "${idFromParams}" not found. It might have been moved or removed.`);
          } else {
            // Try to parse JSON, but fallback if it's not JSON
            let errorData = { message: `Failed to fetch plant details. Server responded with: ${detailResponse.status}` };
            try {
              errorData = await JSON.parse(errorText);
            } catch (e) {
              // Keep generic error if parsing fails
            }
            throw new Error(errorData.message || `Failed to fetch plant details: ${detailResponse.statusText}`);
          }
        } else {
          const plantData: Plant = await detailResponse.json();
          console.log('Plant data received:', plantData);
          setPlant(plantData);
        }

        // Optionally fetch all plants for "Related Plants" or other features
        // You might want to fetch this only if the detail fetch was successful
        // if (detailResponse.ok) { // Only fetch all plants if detail was successful
        //   const plantsResponse = await fetch('/api/plants');
        //   if (!plantsResponse.ok) {
        //     console.warn('Failed to fetch all plants list, RelatedPlants might not work.');
        //     // Decide if this is a critical error or not.
        //     // throw new Error('Failed to fetch the list of all plants');
        //   } else {
        //     const { plants } = await plantsResponse.json();
        //     setAllPlants(plants || []);
        //   }
        // }

      } catch (err: any) {
        console.error('Error in fetchData:', err);
        setError(err.message || 'An unexpected error occurred while loading plant data.');
        setPlant(null); // Ensure plant is null on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idFromParams, router]); // Re-run if idFromParams changes

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={60} color="#14B8A6" /> {/* Or your preferred loader */}
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 md:p-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-700 mb-3">Oops!</h1>
        <p className="text-red-500 mb-4 text-lg">{error || 'The plant data could not be loaded.'}</p>
        <button
          onClick={() => router.push('/identify/all-plants')} // Adjust to your main plants page
          className="mt-2 bg-emerald-500 text-white px-6 py-3 rounded-full hover:bg-emerald-600 text-base font-semibold"
        >
          Browse All Plants
        </button>
      </div>
    );
  }

  // Prepare images for display and lightbox
  let imagesToDisplay: string[] = [];
  if (plant.images && plant.images.length > 0) {
    imagesToDisplay = plant.images.map((img: PlantImage) => img.url).filter(url => !!url);
  } else if (plant.image) { // Fallback to main plant image
    imagesToDisplay = [plant.image];
  }
  
  const handleImageClick = (index: number) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  };

  const scientificName = plant.latin || plant.commonName || 'Details below';

  return (
    <div className="bg-white min-h-screen p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4 md:mb-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {plant.name}{plant.name && !plant.name.toLowerCase().includes('care') ? ' Care' : ''}
            </h1>
            <p className="text-sm text-gray-500 md:italic">
              {scientificName}
            </p>
          </div>
          <button className="text-gray-600 hover:text-gray-800 md:hidden" aria-label="Share plant details">
             <ShareIcon />
          </button>
          <button
            onClick={() => router.push(`/care-plan/${plant.slug || plant._id}`)} // Use slug or _id
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
      
      {/* Images + Description Container */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Images Section */}
        <div className="w-full md:w-1/3 mb-6 md:mb-0">
          {loading ? (
            <Skeleton height={330} className="rounded-xl shadow-md" />
          ) : imagesToDisplay.length > 0 ? (
            <>
              {/* Mobile Image Layout */}
              <div className="flex gap-2 md:hidden">
                {imagesToDisplay[0] && (
                  <img
                    src={imagesToDisplay[0]}
                    alt={`${plant.name} 1`}
                    className="w-2/3 h-auto object-cover rounded-xl shadow-md cursor-pointer"
                    style={{ maxHeight: '330px' }}
                    onClick={() => handleImageClick(0)}
                    onError={(e) => (e.currentTarget.src = '/images/default-plant.jpg')} // Fallback image
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
                        onError={(e) => (e.currentTarget.src = '/images/default-plant.jpg')}
                      />
                    )}
                    {imagesToDisplay[2] && ( 
                      <img
                        src={imagesToDisplay[2]}
                        alt={`${plant.name} 3`}
                        className="w-full h-[calc(50%-0.25rem)] object-cover rounded-xl shadow-md cursor-pointer"
                        onClick={() => handleImageClick(2)}
                        onError={(e) => (e.currentTarget.src = '/images/default-plant.jpg')}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Desktop Image Layout */}
              <div className="hidden md:grid md:grid-cols-2 md:grid-rows-2 md:gap-4">
                {imagesToDisplay.slice(0,4).map((src, idx) => (
                  <img
                    key={`desktop-${idx}`}
                    src={src}
                    alt={`${plant.name} ${idx + 1} (desktop)`}
                    className={`w-full object-cover rounded-lg shadow-md cursor-pointer
                                ${idx === 0 ? 'md:row-span-2 h-full' : 'h-40 md:h-auto'} 
                                ${idx === 0 && imagesToDisplay.length === 1 ? 'md:col-span-2' : ''}
                                ${idx > 0 ? 'aspect-video md:aspect-auto' : ''}
                              `}
                    style={idx === 0 ? {minHeight: '200px'} : {aspectRatio: imagesToDisplay.length > 2 && idx === 1 ? '1/1' : undefined, minHeight: '100px'}}
                    onClick={() => handleImageClick(idx)}
                    onError={(e) => (e.currentTarget.src = '/images/default-plant.jpg')}
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
             />
          )}
        </div>

        {/* Text + Care Requirements Section */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <div>
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <h2 className="text-xl md:text-2xl font-bold md:font-semibold text-gray-900">
                About the {plant.name}
              </h2>
              <div className="flex items-center gap-3 md:gap-4">
                <button aria-label="Bookmark plant" title="Bookmark">
                  <BookmarkCheckIcon />
                </button>
                <button aria-label="Add to favorites" title="Favorite">
                  <HeartIcon />
                </button>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {plant.invitation && <span className="block mb-2 italic">{plant.invitation}</span>}
              {plant.fullDescription || plant.description || 'Detailed description will be available soon.'}
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

          { (plant.careRequirements && plant.careRequirements.length > 0) && (
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Care Requirements</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
                {plant.careRequirements.map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center">
                    {icon ? (
                       <img src={icon} alt={`${label} icon`} className="w-10 h-10 md:w-12 md:h-12 object-contain"/>
                    ) : (
                       <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">?</div>
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

      {/* How to Care Section */}
      {(plant.careSections && plant.careSections.length > 0) && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Care for Your {plant.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Assuming PlantCareSection is adapted for client-side rendering */}
            <PlantCareSection plant={plant} careSections={plant.careSections} />

            <div className="sticky top-24 py-4 px-2 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <img
                  src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fbanner_disease_diagnosis_ac2a80a8a8.webp&w=384&q=75" // Replace with your image
                  alt="Plant health check"
                  className="w-[120px] h-[140px] sm:w-[180px] sm:h-[200px] object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Plant Disease Diagnosis</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Worried about your plant? Let's check its health.</p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/identify/${plant.slug || plant._id}/diagnose`)}
                className="mt-4 px-5 py-2 border border-emerald-500 text-emerald-500 rounded-full hover:bg-emerald-100 w-full sm:w-auto"
              >
                Diagnose My Plant
              </button>
            </div>
          </div>
        </div>
      )}

      <RelatedPlants currentPlantId={plant._id} allPlants={allPlants} />
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