'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiMessageSquare } from 'react-icons/fi';
import RelatedProblem from '../../components/RelatedProblem';
// import { ClipLoader } from 'react-spinners'; // Removed ClipLoader
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Import skeleton CSS

interface PlantProblem {
  _id: string;
  category: string;
  image: string;
  title: string;
  description: string;
}

interface ProblemDetail {
  scientificName: string;
  fullDescription: string;
  SignOfDamage: string;
  images: string[];
}

interface StickyBotanistPostProps {
  problemId: string;
  isSticky: boolean;
}

const StickyBotanistPost = ({ problemId, isSticky }: StickyBotanistPostProps) => {
  const router = useRouter();

  return (
    <div
      className={`${isSticky ? 'sticky top-25' : ''} ${
        isSticky ? 'py-4 px-3' : 'py-6 px-4'
      } bg-white rounded-xl shadow-md transition-all duration-300`}
    >
      <div className={`flex items-center ${isSticky ? 'space-x-3' : 'space-x-4'}`}>
        <div>
          <h3 className={`${isSticky ? 'text-lg' : 'text-xl'} font-semibold text-gray-900`}>
            Botanist Help
          </h3>
          <p className={`text-gray-600 ${isSticky ? 'text-sm' : 'text-base'}`}>
            Send your request and get professional care guide.
          </p>
        </div>
        <img
          src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fbanner_botanist_help_bb0b0c7058.webp&w=384&q=75"
          alt="Plant illustration"
          className={`object-contain rounded-lg ${
            isSticky ? 'w-[126px] h-[140px]' : 'w-[180px] h-[200px]'
          }`}
        />
      </div>
      <button
        onClick={() => router.push(`/ask-the-botanist`)}
        className="mt-4 flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white rounded-full border border-emerald-500 hover:bg-emerald-600 transition duration-200"
      >
        <FiMessageSquare size={isSticky ? 14 : 18} /> Ask the Botanist
      </button>
    </div>
  );
};

const Problem = () => {
  const { problemId } = useParams();
  const router = useRouter();
  const [plant, setPlant] = useState<PlantProblem | null>(null);
  const [detail, setDetail] = useState<ProblemDetail | null>(null);
  const [isStickyActive, setIsStickyActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const damageSectionRef = useRef<HTMLElement | null>(null);

  const id = Array.isArray(problemId) ? problemId[0] : problemId ?? '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Ensure loading is true at the start of fetch
      setError(null); // Reset error
      try {
        // Fetch problem summary
        const problemsResponse = await fetch('/api/problems');
        if (!problemsResponse.ok) {
          throw new Error(`Failed to fetch problems: ${problemsResponse.status}`);
        }
        const problemsData = await problemsResponse.json();
        // console.log('Problems fetched:', problemsData);

        if (!problemsData.problems || !Array.isArray(problemsData.problems)) {
          throw new Error('Invalid problems data structure');
        }

        const foundProblem = problemsData.problems.find((p: PlantProblem) => p._id === id);
        if (!foundProblem) {
          throw new Error(`Problem not found for id: ${id}`);
        }
        setPlant(foundProblem);

        // Fetch problem details
        const detailResponse = await fetch(`/api/problemDetails/${id}`);
        // console.log('Detail Response Status:', detailResponse.status);
        if (!detailResponse.ok) {
          const errorText = await detailResponse.text();
          // console.error('Detail Response Error:', errorText);
          throw new Error(`Failed to fetch problem details: ${errorText}`);
        }
        const detailData = await detailResponse.json();
        // console.log('Detail Data:', detailData);
        setDetail(detailData);
      } catch (err: any) {
        // console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while fetching problem details');
        // Optional: Redirect only if problem not found, or show error message on page
        // router.replace('/problems/all-problem'); 
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
    else {
      setLoading(false);
      setError("Problem ID is missing.");
    }
  }, [id, router]);

  useEffect(() => {
    const currentRef = damageSectionRef.current;
    let observer: IntersectionObserver | null = null;

    if (!loading && currentRef) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target === currentRef) {
              const isIntersecting = entry.isIntersecting;
              setIsStickyActive(!isIntersecting);
              // console.log('IntersectionObserver: isStickyActive set to', !isIntersecting);
            }
          });
        },
        { threshold: 0.1 } // Trigger when 10% of the element is visible/hidden
      );
      observer.observe(currentRef);
      // console.log('Observing damageSectionRef');
    }

    return () => {
      if (observer && currentRef) {
        observer.unobserve(currentRef);
        // console.log('Unobserving damageSectionRef');
      }
    };
  }, [loading]); // Re-run when loading state changes

  if (loading) {
    return (
      <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
        <div className="bg-white min-h-screen">
          <header className="mb-6">
            <div className="flex items-center"></div>
          </header>
          <div className="flex-1 space-y-6 max-w-7xl mx-auto px-4">
            <div className="text-sm mb-4">
              <Skeleton width={250} height={20} />
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4">
                  <Skeleton className="md:row-span-2 w-full !h-auto aspect-[3/4] rounded-lg" style={{minHeight: '400px'}} />
                  <Skeleton className="w-full !h-auto aspect-video rounded-lg" style={{minHeight: '190px'}} />
                  <Skeleton className="w-full !h-auto aspect-video rounded-lg" style={{minHeight: '190px'}} />
                </div>
              </div>
              <div className="flex-1">
                <section>
                  <Skeleton height={36} width="70%" className="mb-3" />
                  <Skeleton count={1} height={20} className="mb-1" />
                  <Skeleton count={1} height={20} width="90%" className="mb-1" />
                  <Skeleton count={1} height={20} width="95%" className="mb-1" />
                  <Skeleton count={1} height={20} width="85%" className="mb-1" />
                  <Skeleton count={1} height={20} width="90%" className="mb-1" />
                </section>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <section className="mt-10 flex-1">
                <Skeleton height={32} width="40%" className="mb-3" />
                <ul className="list-disc list-inside text-left mt-3 space-y-1">
                  <li><Skeleton width="90%" height={18} /></li>
                  <li><Skeleton width="85%" height={18} /></li>
                  <li><Skeleton width="95%" height={18} /></li>
                </ul>
                <div className="mt-6">
                  <Skeleton height={28} width="30%" className="mb-2"/>
                </div>
                <div className="relative flex flex-col items-center bg-gray-100 md:p-10 p-4 pt-12 rounded-3xl mt-5">
                  <Skeleton circle height={48} width={48} className="mb-4"/>
                  <Skeleton height={24} width="60%" className="mb-2 text-center mx-auto"/>
                  <Skeleton count={1} height={18} width="90%" className="mb-1 text-center mx-auto"/>
                  <Skeleton count={1} height={18} width="80%" className="mb-1 text-center mx-auto"/>
                  <Skeleton height={48} width={200} borderRadius={30} className="mt-5 mx-auto"/>
                </div>
              </section>

              <div className="w-full md:w-1/3 md:mt-10"> {/* Adjusted margin for skeleton */}
                <div className={`py-6 px-4 bg-white rounded-xl shadow-md`}>
                  <div className={`flex items-center space-x-4`}>
                    <div>
                      <Skeleton height={24} width={120} className="mb-1"/>
                      <Skeleton height={18} width={200} className="mb-1" />
                      <Skeleton height={18} width={180} />
                    </div>
                    <Skeleton width={180} height={200} className="rounded-lg !hidden md:!block" /> {/* Hide on small, show on md for better layout match */}
                  </div>
                   <Skeleton height={44} width={190} borderRadius={9999} className="mt-4" />
                </div>
              </div>
            </div>
            
            <div className="mt-10">
                <Skeleton height={30} width={200} className="mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
                            <Skeleton height={180} />
                            <div className="p-4">
                                <Skeleton height={20} width="80%" className="mb-2" />
                                <Skeleton count={2} height={16} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  if (error || !plant) {
    // If router.replace was used in fetch, this might not be hit for "not found"
    // but good for other errors or if ID was initially missing.
    if (error === `Problem not found for id: ${id}` || error === "Problem ID is missing.") {
        router.replace('/problems/all-problem'); // Or a dedicated 404 page
        return null; // Return null while redirecting
    }
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center px-4">
        <h2 className="text-2xl font-semibold text-red-600 mb-2">An Error Occurred</h2>
        <p className="text-red-500 text-lg">{error || 'Problem data could not be loaded.'}</p>
        <button
          onClick={() => router.push('/problems/all-problem')}
          className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
        >
          Go to All Problems
        </button>
      </div>
    );
  }

  const images = detail?.images?.length ? detail.images : [plant.image];
  const damagePoints = detail?.SignOfDamage
    ? detail.SignOfDamage.split('\n').filter(Boolean)
    : [];

  return (
    <div className="bg-white min-h-screen pb-10"> {/* Added pb-10 for spacing */}
      <header className="mb-6">
        <div className="flex items-center"></div> {/* Empty header as in original */}
      </header>
      <div className="flex-1 space-y-6 max-w-7xl mx-auto px-4">
        <div className="flex-grow flex items-start justify-start text-left">
          <div className="text-sm">
            <span className="text-gray-700">PlantIn</span>
            <span className="mx-1 text-gray-700">&gt;</span>
            <span className="text-gray-600">Plant Problem</span>
            <span className="mx-1 text-gray-700">&gt;</span>
            <span className="text-gray-500">{plant.title}</span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            {images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4">
                {images.slice(0, 3).map((src: string, idx: number) => ( // Show max 3 images in this layout
                  <img
                    key={idx}
                    src={src}
                    alt={`${plant.title} ${idx + 1}`}
                    className={`${idx === 0 ? 'md:row-span-2 aspect-[3/4]' : 'aspect-video'} w-full h-full object-cover rounded-lg shadow-md cursor-pointer`}
                    onClick={() => {}} // Placeholder for modal or gallery view
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex-1">
            <section>
              <h1 className="text-3xl text-left font-bold text-gray-900 mt-2 mb-2"> {/* Changed h2 to h1 for semantic main title */}
                {plant.title}
              </h1>
              <p className="text-gray-700 text-left leading-relaxed">
                {detail?.fullDescription || 'Detailed description not available.'}
              </p>
            </section>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6"> {/* Removed min-h-screen here, let content define height */}
          {damagePoints.length > 0 && (
            <section ref={damageSectionRef} className="mt-10 flex-1">
              <h2 className="text-3xl text-left font-bold text-black mb-2">
                Signs of Damage
              </h2>
              <ul className="list-disc list-inside text-left mt-3 space-y-1 text-gray-700"> {/* Added text color and spacing */}
                {damagePoints.map((point: string, index: number) => (
                  <li className="font-normal" key={index}>
                    {point}
                  </li>
                ))}
              </ul>
              <article className="paywall mt-8"> {/* Increased margin */}
                <h3 className="text-2xl font-bold text-gray-800">How to prevent</h3> {/* Changed p to h3 */}
              </article>
              <div className="relative flex flex-col items-center bg-blue-100 md:p-10 p-6 pt-12 rounded-3xl mt-5"> {/* Adjusted padding */}
                <img
                  src="data:image/png;base64,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"
                  alt="Premium icon"
                  className="w-12 h-12 mb-4 mx-auto"
                />
                <p className="text-xl text-center font-semibold text-gray-800"> {/* Added text color */}
                  Go Premium to continue reading
                </p>
                <p className="font-normal text-center text-gray-600 mt-1"> {/* Added text color and margin */}
                  Also you’ll get unlimited access to disease identification and all the
                  other beneficial features
                </p>
                <button
                  className="flex bg-transparent items-center justify-center rounded-[30px] cursor-pointer min-w-[196px] w-full text-lg border-none bg-gradient-to-r from-[#04BF94] to-[#52C8AD] text-white shadow-xl hover:shadow-lg hover:bg-gradient-to-r hover:from-[#06D3A4] hover:to-[#60E7C8] disabled:opacity-70 disabled:cursor-not-allowed max-w-[300px] mt-5"
                  type="button"
                >
                  <span className="px-4 py-3 font-semibold">Upgrade to premium</span>
                </button>
              </div>
            </section>
          )}
          {id && ( // Ensure id is available for StickyBotanistPost
            <div className="w-full md:w-1/3 md:mt-10"> {/* Added md:mt-10 to align with section start */}
              <StickyBotanistPost problemId={id} isSticky={isStickyActive} />
            </div>
          )}
        </div>
        <RelatedProblem count={4} />
      </div>
    </div>
  );
};

export default Problem;