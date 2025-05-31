'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MdKeyboardArrowUp } from 'react-icons/md';
import { IoIosArrowDown } from 'react-icons/io';
// Removed: import { ClipLoader } from 'react-spinners';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Import skeleton CSS

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
  category: string;
}

const SkeletonPlantProblems: React.FC = () => (
  <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
    <div className="bg-white min-h-screen">
      {/* Header Skeleton */}
      <header
        className="shadow flex flex-wrap md:flex-nowrap"
        style={{ background: 'linear-gradient(to right, #DDF9D5, #BEFFE4)' }}
      >
        <div className="p-6 w-full md:w-1/2">
          <div className="text-sm mb-2">
            <Skeleton width={150} height={16} /> {/* Breadcrumbs */}
          </div>
          <Skeleton height={36} width="80%" className="mb-3" /> {/* Title */}
          <Skeleton count={2} height={18} className="mb-4" /> {/* Description */}
          <Skeleton height={48} className="w-full md:w-80" style={{ borderRadius: '30px' }} /> {/* Button */}
        </div>
        <div className="w-full md:w-1/2">
            {/* This structure aims to match the flex behavior where image height adjusts to text content height on md+ screens */}
            <Skeleton className="h-64 md:h-full w-full" />
        </div>
      </header>

      {/* Nav Skeleton */}
      <nav className="mt-6 pb-2 px-4"> {/* Added px-4 to match content alignment */}
        <ul className="flex space-x-4 overflow-x-auto no-scrollbar">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index}>
              <Skeleton width={100} height={24} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapsible Description Skeleton */}
      <div className="w-full px-[0.5rem] mx-auto xl:max-w-[1320px] lg:max-w-[1140px] max-w-[960px] mt-5">
        <div className="pt-1 pb-4 px-4 border border-gray-200 rounded-2xl h-[140px] overflow-hidden"> {/* Matched border color */}
          <Skeleton count={4} height={18} style={{ marginBottom: '0.5rem' }} />
        </div>
      </div>

      {/* Item Count Skeleton */}
      <div className="mt-4 text-sm text-gray-500 px-4">
        <Skeleton width={180} height={20} />
      </div>

      {/* Grid Skeleton */}
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
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  </SkeletonTheme>
);


export default function PlantProblems() {
  const params = useParams();
  const slugParam = params.categorySlug;
  const rawSlug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const selectedSlug = rawSlug || 'all-problem';

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredData, setFilteredData] = useState<Problem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true); // Set loading to true at the start of fetch
      try {
        const response = await fetch(`/api/problems?categorySlug=${selectedSlug}`);
        if (!response.ok) throw new Error('Failed to fetch problems');
        const data = await response.json();
        setFilteredData(data.problems);
        setCategories(data.categories);
        setSelectedCategory(data.selectedCategory);
      } catch (error) {
        console.error('Error fetching problems:', error);
        setFilteredData([]);
        // setSelectedCategory(null); // Already null by default or from previous error
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [selectedSlug]);

  if (loading) {
    return <SkeletonPlantProblems />;
  }

  if (!selectedCategory) {
    // This case handles when loading is false, but selectedCategory is still null (e.g., API error, category not found)
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4 bg-white">
        <p className="text-xl text-gray-700 mb-2">Oops! Category Not Found.</p>
        <p className="text-gray-600">
          We couldn't load the plant problem details for the "{selectedSlug}" category.
        </p>
        <p className="text-gray-600 mt-1">
          It might be an invalid category or there was an issue fetching the data.
        </p>
        <Link href="/problems/all-problem" className="mt-6 px-6 py-3 bg-gradient-to-r from-[#04BF94] to-[#52C8AD] text-white rounded-[30px] hover:shadow-lg font-semibold">
          View All Problems
        </Link>
      </div>
    );
  }

  const isAllProblems = selectedCategory.slug === 'all-problem';
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
              <span className="text-gray-700">PlantIn</span>
              <span className="mx-1 text-gray-700">&gt;</span>
              <span className="text-gray-600">Plant Problem</span>
            </div>
          </div>
          <p className="text-3xl text-left md:text-4xl font-bold text-black">
            {selectedCategory.title}
          </p>
          <p className="text-sm text-left">
            {selectedCategory.description}
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
            src={selectedCategory.headerImage}
            alt={`${selectedCategory.name} Illustration`}
            className="w-full h-full object-cover"
          />
        </div>
      </header>
      <nav className="mt-6 pb-2 px-4"> {/* Added px-4 for consistency */}
        <ul className="flex space-x-4 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <li key={cat.slug}>
              <Link
                href={`/problems/${cat.slug}`}
                className={`pb-1 whitespace-nowrap font-medium ${
                  selectedSlug === cat.slug
                    ? 'text-gray-600 underline decoration-teal-500' // Changed to gray-600 for consistency, teal underline
                    : 'text-gray-600'
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
          className={`relative pt-1 pb-4 px-4 border border-gray-200 rounded-2xl mt-5 overflow-hidden transition-all duration-300 ease-in-out ${ // Matched border color, added duration
            expanded ? 'max-h-[1000px]' : 'max-h-[140px] h-[140px]' // Use max-h for smoother transition
          }`}
        >
          <div className={`text-gray-700 ${expanded ? '' : 'line-clamp-5'}`}> {/* Added line-clamp for non-expanded state */}
            {selectedCategory.mainDescription}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="absolute bg-white p-2 text-blue-500 text-xl font-bold bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-blue-500 hover:bg-blue-50 transition-colors" // Centered button
          >
            {expanded ? <MdKeyboardArrowUp /> : <IoIosArrowDown />}
          </button>
          {expanded && (
            <div className="mt-4 pt-4 border-t border-gray-200"> {/* Added border-t and padding */}
              {(isAllProblems || selectedCategory.commonProblemsDescription) && (
                <div className="pt-2"> {/* Adjusted padding */}
                  <p className="text-left text-2xl font-bold p-2">
                    {isAllProblems ? 'What Are the Common Problems in Plants?' : `${selectedCategory.name} Overview`}
                  </p>
                  <div
                    className="text-lg text-gray-700 text-left prose max-w-none" // Added prose for better HTML rendering
                    dangerouslySetInnerHTML={{
                      __html: selectedCategory.commonProblemsDescription || 
                        'Common problems description not available for this category.'
                    }}
                  />
                </div>
              )}
              {selectedCategory.diagnosisSteps && (
                <div className="pt-2 mt-4"> {/* Adjusted padding and margin */}
                  <p className="text-left text-2xl font-bold p-2">
                    {getDiagnosisTitle()}
                  </p>
                  <div
                    className="text-lg text-gray-700 text-left prose max-w-none" // Added prose
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
      <div className="mt-4 text-sm text-gray-500 px-4">
        {filteredData.length} items match “{selectedCategory.name}”
      </div>
      {filteredData.length === 0 ? (
        <div className="text-center text-gray-600 mt-6 py-10"> {/* Added padding */}
          No problems found for the category “{selectedCategory.name}”.
        </div>
      ) : (
        <div className="mx-auto w-full px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredData.map(item => (
              <Link href={`/problem/${item._id}`} key={item._id}>
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"> {/* Added transition duration */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="font-bold text-lg mb-1 line-clamp-2">{item.title}</h2> {/* Added line-clamp */}
                    <p className="text-gray-700 text-sm line-clamp-3">{item.description}</p> {/* Added line-clamp */}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Tailwind CSS Prose styles might require @tailwindcss/typography plugin */
        /* If not using the plugin, you might need to add some basic styles for dangerouslySetInnerHTML content */
        .prose h1, .prose h2, .prose h3, .prose h4, .prose p, .prose ul, .prose ol, .prose blockquote {
          margin-bottom: 1em;
        }
        .prose ul, .prose ol {
          padding-left: 1.5em;
        }
        .prose li > p { /* Fix for potential extra margin on p inside li */
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
}