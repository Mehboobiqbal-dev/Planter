'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { setAccessToken } from '../../redux/slices/authSlice';
import { RootState } from '../../redux/store';
import ClipLoader from 'react-spinners/ClipLoader';
import ImageLightbox from '../../components/ImageLightbox';
import PlantCareSection from '../../components/PlantCareSection';
import RelatedPlants from '../../components/RelatedPlants';
import PopularArticles from '../../components/PopularArticle';

interface Plant {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  detailId: string | null;
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

interface PlantDetail {
  _id: string;
  scientificName?: string;
  fullDescription?: string;
  images?: string[];
  care?: Record<string, string>;
  careRequirements?: CareRequirement[];
  careSections?: CareSection[];
}

// Placeholder SVGs for icons shown in the mobile screenshot
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

const HeartIconOutline = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);


export default function PlantsDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';
  
  const [allPlants, setAllPlants] = useState<Plant[]>([]);
  const [detail, setDetail] = useState<PlantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (session?.accessToken) {
      dispatch(setAccessToken(session.accessToken));
    } else if (status === 'unauthenticated') {
      dispatch(setAccessToken(null));
    }
  }, [session, status, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        router.replace('/identify/all-plants');
        setLoading(false);
        return;
      }
      if (status === 'loading') return;
      if (status === 'unauthenticated') {
        router.push('/api/auth/signin');
        setLoading(false);
        return;
      }
      if (!session?.accessToken) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const plantsRes = await fetch('/api/plants', {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        if (!plantsRes.ok) {
          const errorData = await plantsRes.json();
          throw new Error(errorData.message || 'Failed to fetch plants');
        }
        const plantsData = await plantsRes.json();
        setAllPlants(plantsData.plants);

        const currentPlant = plantsData.plants.find((p: Plant) => p._id === id);
        if (!currentPlant) {
          router.replace('/identify/all-plants');
          setLoading(false);
          return;
        }

        if (currentPlant.detailId) {
          const detailRes = await fetch(`/api/plantDetails/${currentPlant.detailId}`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          });
          if (detailRes.ok) {
            setDetail(await detailRes.json());
          } else {
            const errorData = await detailRes.json();
            console.warn(`Failed to fetch details for detailId: ${currentPlant.detailId}`, errorData);
            setError(errorData.message || 'Failed to fetch plant details');
            setDetail(null);
          }
        } else {
          setDetail(null);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router, status, session?.accessToken, dispatch]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={60} color="#14B8A6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 md:p-6">
        Error: {error}
        {error.includes('Unauthorized') && (
          <div>
            <p>Please log in to view this page.</p>
            <button
              onClick={() => router.push('/api/auth/signin')}
              className="mt-2 bg-emerald-400 text-white px-4 py-2 rounded-full hover:bg-emerald-500"
            >
              Log In
            </button>
          </div>
        )}
      </div>
    );
  }

  const plant = allPlants.find((p) => p._id === id);

  if (!plant) {
    return <div className="flex justify-center items-center h-screen"><p>Plant data not available.</p></div>;
  }

  const images: string[] = detail?.images?.length ? detail.images : plant.image ? [plant.image] : [];
  const scientificName = detail?.scientificName || plant.description; // Use description as fallback for mobile view

  return (
    <div className="bg-white min-h-screen p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-6">
        {/* Top row: Title/Subtitle and Share icon (mobile) / Title/Subtitle & Desktop Button (desktop) */}
        <div className="flex justify-between items-center mb-4 md:mb-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {plant.name}{plant.name.toLowerCase().includes('care') ? '' : ' Care'}
            </h1>
            <p className="text-sm text-gray-500 md:italic">
              {scientificName}
            </p>
          </div>
          <button className="text-gray-600 hover:text-gray-800 md:hidden" aria-label="Share plant details">
             <ShareIcon />
          </button>
          {/* Desktop "Get Care Plan" button */}
          <button
            onClick={() => router.push(`/care-plan/${id}`)}
            className="hidden md:block bg-emerald-400 text-white px-4 py-2 rounded-full hover:bg-emerald-500"
          >
            Get Care Plan
          </button>
        </div>

        {/* "View Care Plan" button - visible only on mobile, full width */}
        <button
          onClick={() => router.push(`/care-plan/${id}`)}
          className="mt-1 w-full bg-teal-500 text-white py-3 rounded-[28px] text-base font-semibold md:hidden"
        >
          View Care Plan
        </button>
      </div>
      
      {/* Images + Description Container */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Images Section */}
        {images.length > 0 && (
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            {/* Mobile Image Layout */}
            <div className="flex gap-2 md:hidden">
              {images[0] && (
                <img
                  src={images[0]}
                  alt={`${plant.name} 1`}
                  className="w-2/3 h-auto object-cover rounded-xl shadow-md cursor-pointer"
                  style={{ maxHeight: '330px' }} // Approximate height from screenshot
                  onClick={() => { setPhotoIndex(0); setLightboxOpen(true); }}
                />
              )}
              {images.length > 1 && (
                <div className="w-1/3 flex flex-col gap-2" style={{ maxHeight: '330px' }}>
                  {images[1] && (
                    <img
                      src={images[1]}
                      alt={`${plant.name} 2`}
                      className="w-full h-[calc(50%-0.25rem)] object-cover rounded-xl shadow-md cursor-pointer"
                      onClick={() => { setPhotoIndex(1); setLightboxOpen(true); }}
                    />
                  )}
                  {images[2] && ( // Show third image if available
                    <img
                      src={images[2]}
                      alt={`${plant.name} 3`}
                      className="w-full h-[calc(50%-0.25rem)] object-cover rounded-xl shadow-md cursor-pointer"
                      onClick={() => { setPhotoIndex(2); setLightboxOpen(true); }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Desktop Image Layout (Original Grid) */}
            <div className="hidden md:grid md:grid-cols-2 md:grid-rows-2 md:gap-4">
              {images.map((src: string, idx: number) => (
                <img
                  key={`desktop-${idx}`}
                  src={src}
                  alt={`${plant.name} ${idx + 1} (desktop)`}
                  className={`w-full object-cover rounded-lg shadow-md cursor-pointer
                              ${idx === 0 ? 'md:row-span-2 h-full' : 'h-40 md:h-auto'} 
                              ${idx === 0 && images.length === 1 ? 'md:col-span-2' : ''}
                              ${idx > 0 ? 'aspect-video md:aspect-auto' : ''}
                            `}
                  style={idx === 0 ? {} : {aspectRatio: images.length > 2 && idx === 1 ? '1/1' : undefined}} // Adjust for better looks for 2nd/3rd images
                  onClick={() => {
                    setPhotoIndex(idx);
                    setLightboxOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Text + Care Requirements Section */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <div>
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <h2 className="text-xl md:text-2xl font-bold md:font-semibold text-gray-900">
                What is the plant
              </h2>
              <div className="flex items-center gap-3 md:gap-4">
                <button aria-label="Bookmark plant">
                  <BookmarkCheckIcon />
                </button>
                <button aria-label="Add to favorites">
                  <HeartIconOutline />
                </button>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {detail?.fullDescription || 'Detailed description not available.'}
            </p>
            <p className="mt-4 text-sm text-gray-600">
              If you’ve recognized any mistakes, feel free to notify us. This helps us maintain quality.
            </p>
          </div>

          { (detail?.careRequirements && detail.careRequirements.length > 0) && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Care Requirements</h2>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                {detail.careRequirements.map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center">
                    <img
                      src={icon}
                      alt={`${label} icon`}
                      className="w-12 h-12"
                    />
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
      {(detail?.careSections && detail.careSections.length > 0) && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Care for the Plant</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <PlantCareSection plant={plant} careSections={detail?.careSections} />

            <div className="sticky top-24 py-4 px-2 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <img
                  src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fbanner_disease_diagnosis_ac2a80a8a8.webp&w=384&q=75"
                  alt="Plant illustration"
                  className="w-[180px] h-[200px] object-cover"
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

      <RelatedPlants id={id} allPlants={allPlants} />
      <PopularArticles />

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          startIndex={photoIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}