'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdKeyboardArrowUp } from 'react-icons/md';
import { IoIosArrowDown } from 'react-icons/io';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Category {
  name: string;
  slug: string;
  headerImage: string;
  title: string;
  description: string;
  mainDescription: string;
  commonProblemsDescription: string;
  diagnosisSteps: string;
}

interface Problem {
  _id: string;
  image: string;
  title: string;
  description: string;
  category: string; // Category slug
}

const SkeletonProblemDetail: React.FC = () => (
    <div className="w-full px-[0.5rem] mx-auto xl:max-w-[1320px] lg:max-w-[1140px] max-w-[960px] py-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Skeleton height={256} className="w-full rounded-md mb-4" />
        <Skeleton height={36} width="70%" className="mb-3" />
        <Skeleton count={3} height={18} className="mb-1" />
        <Skeleton height={18} width="80%" className="mb-4" />
        <Skeleton count={5} height={18} className="mb-1" />
        <Skeleton height={18} width="90%" />
      </div>
    </div>
  );

const SkeletonPlantProblems: React.FC<{ isDetailView?: boolean }> = ({ isDetailView = false }) => (
  <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
    <div className="bg-white min-h-screen">
      <header
        className="shadow flex flex-wrap md:flex-nowrap"
        style={{ background: 'linear-gradient(to right, #DDF9D5, #BEFFE4)' }}
      >
        <div className="p-6 w-full md:w-1/2">
          <div className="text-sm mb-2">
            <Skeleton width={150} height={16} />
          </div>
          <Skeleton height={36} width="80%" className="mb-3" />
          <Skeleton count={2} height={18} className="mb-4" />
          <Skeleton height={48} className="w-full md:w-80" style={{ borderRadius: '30px' }} />
        </div>
        <div className="w-full md:w-1/2">
            <Skeleton className="h-64 md:h-full w-full" />
        </div>
      </header>

      <nav className="mt-6 pb-2 px-4">
        <ul className="flex space-x-4 overflow-x-auto no-scrollbar">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index}>
              <Skeleton width={100} height={24} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="w-full px-[0.5rem] mx-auto xl:max-w-[1320px] lg:max-w-[1140px] max-w-[960px] mt-5">
        <div className="pt-1 pb-4 px-4 border border-gray-200 rounded-2xl h-[140px] overflow-hidden">
          <Skeleton count={4} height={18} style={{ marginBottom: '0.5rem' }} />
        </div>
      </div>

      {isDetailView ? (
        <SkeletonProblemDetail />
      ) : (
        <>
          <div className="mt-4 text-sm text-gray-500 px-4">
            <Skeleton width={180} height={20} />
          </div>
          <div className="mx-auto w-full px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <Skeleton height={160} className="w-full" />
                  <div className="p-4">
                    <Skeleton height={24} width="80%" className="mb-2" />
                    <Skeleton count={2} height={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  </SkeletonTheme>
);


export default function PlantProblems() {
  const params = useParams();
  const router = useRouter();

  const categorySlugFromUrl = Array.isArray(params.categorySlug) ? params.categorySlug[0] : params.categorySlug as string | undefined;
  const problemIdFromUrl = params.problemId ? (Array.isArray(params.problemId) ? params.problemId[0] : params.problemId as string | undefined) : undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [problemList, setProblemList] = useState<Problem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorOccurred(false);
      // Reset states more carefully based on view type
      // setSelectedProblem(null); // Resetting this might cause issues if useEffect depends on selectedProblem.category
      // setProblemList([]);

      try {
        if (problemIdFromUrl) {
          // Detail View
          setSelectedProblem(null); // Clear previous problem detail
          setProblemList([]);     // No list in detail view context

          const problemDetailResponse = await fetch(`/api/problem/${problemIdFromUrl}`);
          if (!problemDetailResponse.ok) {
            throw new Error(`Problem ${problemIdFromUrl} not found or API error`);
          }
          const problemPayload = await problemDetailResponse.json();
          const fetchedProblem: Problem = problemPayload.problem;

          if (!fetchedProblem || !fetchedProblem.category) {
             throw new Error(`Problem data for ${problemIdFromUrl} is invalid or missing category.`);
          }
          
          const actualProblemCategorySlug = fetchedProblem.category;

          // If URL category is present, not 'all-problem', and mismatches problem's actual category, redirect.
          if (categorySlugFromUrl && categorySlugFromUrl !== 'all-problem' && categorySlugFromUrl !== actualProblemCategorySlug) {
            router.replace(`/problems/${actualProblemCategorySlug}/${problemIdFromUrl}`);
            // setLoading(false) will be skipped due to the finally block condition
            return; 
          }
          
          setSelectedProblem(fetchedProblem);
          
          // Determine context category: if URL is all-problem, use actual problem's cat; else use URL's cat or actual problem's cat.
          const categoryContextSlug = categorySlugFromUrl === 'all-problem' 
                                      ? actualProblemCategorySlug 
                                      : (categorySlugFromUrl || actualProblemCategorySlug);

          const categoryContextResponse = await fetch(`/api/problems?categorySlug=${categoryContextSlug}`);
          if (!categoryContextResponse.ok) {
            throw new Error(`Failed to fetch category context for ${categoryContextSlug}`);
          }
          const categoryContextData = await categoryContextResponse.json();
          setCategories(categoryContextData.categories);
          setSelectedCategory(categoryContextData.selectedCategory);
          // problemList remains empty for detail view

        } else {
          // List View
          setSelectedProblem(null); // Ensure no problem is selected

          const listFetchSlug = categorySlugFromUrl || 'all-problem';

          // If navigating to base /problems, redirect to /problems/all-problem
          if (!categorySlugFromUrl && typeof window !== 'undefined') {
            router.replace(`/problems/all-problem`);
            // setLoading(false) will be skipped
            return;
          }

          const response = await fetch(`/api/problems?categorySlug=${listFetchSlug}`);
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Try to parse error
            throw new Error(`Failed to fetch problem list for ${listFetchSlug}: ${response.status} ${errorData.error || ''}`);
          }
          const data = await response.json();
          setProblemList(data.problems);
          setCategories(data.categories);
          setSelectedCategory(data.selectedCategory);
        }
      } catch (error)
      {
        console.error('Error fetching data:', error);
        setErrorOccurred(true);
        // Clear all data states on error
        setSelectedCategory(null);
        setSelectedProblem(null);
        setProblemList([]);
        setCategories([]);
      } finally {
        // Condition to prevent setting loading to false if a redirect is pending
        const isRedirectingForProblemCategoryMismatch = 
            problemIdFromUrl && 
            categorySlugFromUrl && 
            categorySlugFromUrl !== 'all-problem' && 
            selectedProblem?.category && // Check selectedProblem AFTER it's set
            categorySlugFromUrl !== selectedProblem.category;

        const isRedirectingForBaseProblemsPath = 
            !categorySlugFromUrl && 
            problemIdFromUrl === undefined && 
            typeof window !== 'undefined';

        if (!isRedirectingForProblemCategoryMismatch && !isRedirectingForBaseProblemsPath) {
             setLoading(false);
        }
      }
    };

    fetchData();
  }, [categorySlugFromUrl, problemIdFromUrl, router]); // Removed selectedProblem.category, router.replace should trigger re-render with new params.


  if (loading) {
    return <SkeletonPlantProblems isDetailView={!!problemIdFromUrl} />;
  }

  if (errorOccurred || !selectedCategory) {
    const messageTitle = problemIdFromUrl ? "Oops! Problem Not Found." : "Oops! Category Not Found.";
    const messageBody = problemIdFromUrl 
        ? `We couldn't load the details for this plant problem. It might be invalid or there was an issue fetching the data.`
        : `We couldn't load the plant problem details for the "${categorySlugFromUrl || 'requested'}" category. This category might not exist.`;
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4 bg-white">
        <p className="text-xl text-gray-700 mb-2">{messageTitle}</p>
        <p className="text-gray-600">{messageBody}</p>
        <Link href="/problems/all-problem" className="mt-6 px-6 py-3 bg-gradient-to-r from-[#04BF94] to-[#52C8AD] text-white rounded-[30px] hover:shadow-lg font-semibold">
          View All Problems
        </Link>
      </div>
    );
  }
  
  const currentDisplaySlug = selectedCategory.slug; // This is the slug of the category being displayed (could be 'all-problem')

  const isAllProblemsView = selectedCategory.slug === 'all-problem';
  const getDiagnosisTitle = () => {
    if (selectedCategory.name === 'Pests') return 'How to Identify Pests Problems';
    if (selectedCategory.name === 'Diseases') return 'How to Identify Plant Diseases';
    if (selectedCategory.name === 'Weeds') return 'How to Identify Weeds Problems';
    return `How to Diagnose ${selectedCategory.name} Problems`;
  };

  return (
    <div className="bg-white min-h-screen">
      <header
        className="shadow flex flex-wrap md:flex-nowrap"
        style={{ background: 'linear-gradient(to right, #DDF9D5, #BEFFE4)' }}
      >
        <div className="p-6 w-full md:w-1/2">
          <div className="flex-grow flex items-start justify-start text-left">
            <div className="text-sm">
              <Link href="/" className="text-gray-700 hover:underline">PlantIn</Link>
              <span className="mx-1 text-gray-700">{'>'}</span>
              <Link href="/problems/all-problem" className="text-gray-600 hover:underline">Plant Problem</Link>
              {selectedCategory.slug !== 'all-problem' && (
                <>
                  <span className="mx-1 text-gray-700">{'>'}</span>
                  <Link href={`/problems/${selectedCategory.slug}`} className="text-gray-600 hover:underline">{selectedCategory.name}</Link>
                </>
              )}
              {selectedProblem && (
                 <>
                  <span className="mx-1 text-gray-700">{'>'}</span>
                  {/* Link to the problem detail page, using its actual category for the URL context */}
                  <Link 
                    href={`/problems/${selectedProblem.category}/${selectedProblem._id}`} 
                    className="text-gray-500 font-semibold truncate max-w-[150px] inline-block hover:underline"
                  >
                    {selectedProblem.title}
                  </Link>
                 </>
              )}
            </div>
          </div>
          <p className="text-3xl text-left md:text-4xl font-bold text-black mt-2">
            {selectedProblem ? selectedProblem.title : selectedCategory.title}
          </p>
          <p className="text-sm text-left mt-1">
            {selectedProblem ? `Learn about ${selectedProblem.title} and how to manage it.` : selectedCategory.description}
          </p>
          <button
            type="button"
            className="flex items-center justify-center rounded-[30px] mt-4 w-full md:w-80 px-4 py-3 font-semibold text-white bg-gradient-to-r from-[#04BF94] to-[#52C8AD] shadow-xl hover:shadow-lg hover:from-[#06D3A4] hover:to-[#60E7C8]"
          >
            <img src="https://myplantin.com/icons/camera.svg" alt="Camera Icon" className="w-5 h-5 mr-2" />
            Diagnose a Plant
          </button>
        </div>
        <div className="w-full md:w-1/2 h-64 md:h-auto">
          <img
            src={selectedProblem ? selectedProblem.image : selectedCategory.headerImage}
            alt={selectedProblem ? selectedProblem.title : `${selectedCategory.name} Illustration`}
            className="w-full h-full object-cover"
          />
        </div>
      </header>
      <nav className="mt-6 pb-2 px-4">
        <ul className="flex space-x-4 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <li key={cat.slug}>
              <Link
                href={`/problems/${cat.slug}`}
                className={`pb-1 whitespace-nowrap font-medium ${
                  currentDisplaySlug === cat.slug // currentDisplaySlug IS selectedCategory.slug
                    ? 'text-teal-600 border-b-2 border-teal-500' // Enhanced active style
                    : 'text-gray-600 hover:text-teal-600'
                }`}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="w-full px-[0.5rem] mx-auto xl:max-w-[1320px] lg:max-w-[1140px] max-w-[960px]">
        <div
          className={`relative pt-1 pb-4 px-4 border border-gray-200 rounded-2xl mt-5 overflow-hidden transition-all duration-300 ease-in-out ${
            expanded ? 'max-h-[2000px]' : 'max-h-[140px] h-[140px]'
          }`}
        >
          <div className={`text-gray-700 ${expanded ? '' : 'line-clamp-5'}`}>
            {selectedCategory.mainDescription}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="absolute bg-white p-2 text-blue-500 text-xl font-bold bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-blue-500 hover:bg-blue-50 transition-colors"
            aria-label={expanded ? "Collapse description" : "Expand description"}
          >
            {expanded ? <MdKeyboardArrowUp /> : <IoIosArrowDown />}
          </button>
          {expanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {(isAllProblemsView || selectedCategory.commonProblemsDescription) && (
                <div className="pt-2">
                  <p className="text-left text-2xl font-bold p-2">
                    {isAllProblemsView ? 'What Are the Common Problems in Plants?' : `${selectedCategory.name} Overview`}
                  </p>
                  <div
                    className="text-lg text-gray-700 text-left prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: selectedCategory.commonProblemsDescription || 
                        'Common problems description not available for this category.'
                    }}
                  />
                </div>
              )}
              {selectedCategory.diagnosisSteps && !isAllProblemsView && ( // Only show for specific categories, not "All Problems"
                <div className="pt-2 mt-4">
                  <p className="text-left text-2xl font-bold p-2">
                    {getDiagnosisTitle()}
                  </p>
                  <div
                    className="text-lg text-gray-700 text-left prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: selectedCategory.diagnosisSteps || 
                        'Diagnosis steps not available for this category.'
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedProblem ? (
        <div className="w-full px-[0.5rem] mx-auto xl:max-w-[1320px] lg:max-w-[1140px] max-w-[960px] py-6">
          <article className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
            <p className="text-left text-2xl font-bold p-2 mb-2">Problem Details</p>
            <div 
                className="text-lg text-gray-700 text-left prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: selectedProblem.description }}
            />
          </article>
        </div>
      ) : (
        <>
          <div className="mt-4 text-sm text-gray-500 px-4">
            {problemList.length} item{problemList.length !== 1 ? 's' : ''} match “{selectedCategory.name}”
          </div>
          {problemList.length === 0 ? (
            <div className="text-center text-gray-600 mt-6 py-10 px-4">
              No problems found for the category “{selectedCategory.name}”. Try selecting another category or viewing all problems.
            </div>
          ) : (
            <div className="mx-auto w-full px-4 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {problemList.map(item => {
                  // Determine the correct link for the problem item
                  // If viewing "All Problems", use the item's actual category slug in the URL
                  // Otherwise, use the currently selected category's slug
                  const problemLink = isAllProblemsView
                    ? `/problems/${item.category}/${item._id}` // item.category is the problem's specific category slug
                    : `/problems/${selectedCategory.slug}/${item._id}`; // selectedCategory.slug is the current view's slug

                  return (
                    <Link 
                      href={problemLink}
                      key={item._id}
                      className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                      <div> {/* Removed nested div, Link can be the card itself */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                          <h2 className="font-bold text-lg mb-1 line-clamp-2">{item.title}</h2>
                          <p className="text-gray-700 text-sm line-clamp-3">{item.description}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .prose h1, .prose h2, .prose h3, .prose h4, .prose p, .prose ul, .prose ol, .prose blockquote {
          margin-bottom: 1em; /* Tailwind prose should handle this, but good to have if overriding */
        }
        .prose ul, .prose ol {
          padding-left: 1.5em; /* Tailwind prose should handle this */
        }
        .prose li > p {
          margin-bottom: 0.5em; /* Tailwind prose should handle this */
        }
      `}</style>
    </div>
  );
}