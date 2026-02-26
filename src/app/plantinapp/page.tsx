'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface FAQ {
  question: string;
  answer: string;
}

const PlantIdentificationAppPage: React.FC = () => {
  // Slider images for Customer Stories
  const sliderImages = [
    'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FGroup_36988_92113b76cb.webp&w=3840&q=75',
    'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FGroup_36989_5c16a9ae79.webp&w=3840&q=75',
    'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FGroup_36990_99fe9b1e11.webp&w=3840&q=75',
    'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FGroup_36987_1ead159a0c.webp&w=3840&q=75',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % sliderImages.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + sliderImages.length) % sliderImages.length);
  };


  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-center px-4 py-12 mx-auto max-w-[1320px]">
        <div className="flex-1 p-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-left text-gray-900">
            Plant Identification App, Perfected
          </h1>
          <p className="text-lg mb-6 text-left text-gray-700">
            Identify plants – flowers, cactuses, succulents, and trees instantly. Get top-notch care guides and botanists’ assistance.
          </p>
          <button className="bg-teal-700 text-white py-3 px-6 rounded-full hover:bg-teal-800 transition duration-200">
            Get Cared Tools
          </button>
        </div>
        <div className="flex-1 flex justify-end">
          <Image
            src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FGroup_36979_253a764eec.webp&w=1920&q=75"
            alt="Boost Plant Growth"
            width={600}
            height={400}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
      </section>

      {/* Customer Stories Section */}
      <section className="py-12">
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-8">Our Customers’ Stories</h2>
        <div className="max-w-[1320px] mx-auto px-4 relative">
          <Image
            src={sliderImages[currentIndex]}
            alt={`Customer story image ${currentIndex + 1}`}
            width={1320}
            height={400}
            className="w-full h-auto object-cover rounded-lg"
          />
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-teal-700 text-white p-3 rounded-full hover:bg-teal-800 transition duration-200"
            aria-label="Previous Image"
          >
            &lt;
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-teal-700 text-white p-3 rounded-full hover:bg-teal-800 transition duration-200"
            aria-label="Next Image"
          >
            &gt;
          </button>
          <div className="mt-6 text-center">
            <p className="text-lg text-gray-700 italic">
              “I’ve downloaded this app and it REALLY WORKS!!! I love it!!!” – deborah_scissorhand
            </p>
            <p className="text-lg text-gray-700 italic mt-2">
              “This is my favorite app on my phone! 💚” – taylorpeacock77
            </p>
          </div>
        </div>
      </section>

      {/* How PlantIn Works Section */}
      <section className="bg-white py-12">
        <div className="flex flex-col md:flex-row items-center justify-center px-4 mx-auto max-w-[1320px]">
          <div className="flex-1 p-6 order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-left text-gray-900">How PlantIn Works</h2>
            <ul className="space-y-4">
              <li className="flex items-center space-x-4">
                <Image
                  src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fcamera_1_1_e8d06a1cab.webp&w=256&q=75"
                  alt="Take a plant photo"
                  width={50}
                  height={50}
                />
                <span className="text-lg text-gray-700">Take a plant photo</span>
              </li>
              <li className="flex items-center space-x-4">
                <Image
                  src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FAI_8e586f271e.webp&w=256&q=75"
                  alt="AI plant recognition"
                  width={50}
                  height={50}
                />
                <span className="text-lg text-gray-700">Wait until our AI recognizes the species</span>
              </li>
              <li className="flex items-center space-x-4">
                <Image
                  src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fround_add_button_1_691e849a34.webp&w=256&q=75"
                  alt="Add plant to list"
                  width={50}
                  height={50}
                />
                <span className="text-lg text-gray-700">Add it to your list of plants</span>
              </li>
              <li className="flex items-center space-x-4">
                <Image
                  src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FCare_4487db85e9.webp&w=256&q=75"
                  alt="Care assistance"
                  width={50}
                  height={50}
                />
                <span className="text-lg text-gray-700">Get all the care assistance you request</span>
              </li>
            </ul>
            <div className="flex mt-6 space-x-4">
              <a href="https://apps.apple.com/us/app/plantin-plant-identifier-care/id1527399597">
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on the App Store"
                  className="h-12"
                />
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.plantin.app">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  className="h-12"
                />
              </a>
            </div>
          </div>
          <div className="flex-1 order-1 md:order-2">
            <Image
              src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fhow_plantin_works_276118c9a5.webp&w=3840&q=75"
              alt="How PlantIn Works"
              width={600}
              height={400}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Why Subscribe Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-[1320px] mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">Why Subscribe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Best Plant Identifier</h3>
              <p className="text-lg font-bold text-teal-700">10.5M+ Identified Plants</p>
              <p className="mt-2 text-gray-700">Find out what plant you are looking at.</p>
            </div>
            <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Prompt Plant Consultant Assistance</h3>
              <p className="text-lg font-bold text-teal-700">12K+ Botanist Consultations</p>
              <p className="mt-2 text-gray-700">Our experts will help you fight any plant issue with personalized guides.</p>
            </div>
            <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <h3 className="text-xl font-semibold text-gray-900">Plant Community</h3>
                <span className="ml-2 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">New</span>
              </div>
              <p className="text-lg font-bold text-teal-700">12K+ Posts About Plants</p>
              <p className="mt-2 text-gray-700">Connect with other plant enthusiasts from all around the globe.</p>
            </div>
            <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Selection of Unique Articles</h3>
              <p className="text-lg font-bold text-teal-700">50+ Qualified Experts</p>
              <p className="mt-2 text-gray-700">Find out gardening insights with our numerous blog rubrics.</p>
            </div>
            <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Accurate Diagnosis of Plant Diseases</h3>
              <p className="text-lg font-bold text-teal-700">7M+ Saved Plants</p>
              <p className="mt-2 text-gray-700">Cure plant disease with our custom-made guides and keep your pets alive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white py-12">
        <div className="max-w-[1320px] mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">Get Premium Care Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">90 Days Access</h3>
              <p className="text-sm text-gray-500 mb-2">3-day trial</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                $59.99 <span className="text-sm font-normal">($2.00/day)</span>
              </p>
              <p className="text-sm text-red-500 mb-4">09:54 -33%</p>
              <button className="bg-teal-700 text-white py-2 px-4 rounded-full hover:bg-teal-800 transition duration-200">
                Get Trial
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center relative">
              <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-teal-700 text-white text-sm font-bold px-4 py-1 rounded-full">
                Most Popular
              </span>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">7 Days Access</h3>
              <p className="text-sm text-gray-500 mb-2">3-day trial</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                $9.99 <span className="text-sm font-normal">($1.43/day)</span>
              </p>
              <button className="bg-teal-700 text-white py-2 px-4 rounded-full hover:bg-teal-800 transition duration-200">
                Get Trial
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">30 Days Access</h3>
              <p className="text-sm text-gray-500 mb-2">3-day trial</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                $39.99 <span className="text-sm font-normal">($1.33/day)</span>
              </p>
              <button className="bg-teal-700 text-white py-2 px-4 rounded-full hover:bg-teal-800 transition duration-200">
                Get Trial
              </button>
            </div>
          </div>
          <p className="text-center text-lg text-gray-700 mt-8">
            More than 10 million people regularly use the app to take care of their plants and recognize new ones. After a tremendous number of positive reviews and preserved plants in 97% of cases, we are ready to return your money if you’re unsatisfied with the results. We’re sure your garden will grow and bloom with us!
          </p>

        </div>
      </section>




      {/* Download Section */}
      <section className="bg-white py-12">
        <div className="max-w-[1320px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">

            {/* Left side: Text + Buttons */}
            <div className="md:w-1/2 space-y-6 text-left">
              <h4 className='text-2xl font'>One solution for all the platforms</h4>
              <p className="text-lg text-gray-700">
                Prefer big screens? Get your plant care assistance on the desktop. PlantIn provides simultaneous access to the web and mobile versions. All data is synchronized.
              </p>
              <div className="flex space-x-4">
                <a href="https://apps.apple.com/us/app/plantin-plant-identifier-care/id1527399597">
                  <img
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                    alt="Download on the App Store"
                    className="h-12"
                  />
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.plantin.app">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Get it on Google Play"
                    className="h-12"
                  />
                </a>
              </div>
            </div>

            {/* Right side: Image */}
            <div className="md:w-1/2">
              <Image
                src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FGroup_36915_dc91ac364d.webp&w=1200&q=75"
                alt="Boost Plant Growth"
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Florinis 7, Greg Tower, 2nd Floor, 1065, Nicosia, Cyprus
            </p>
            <p className="text-sm text-gray-500">©2025 Planter. All rights reserved</p>
          </div>
        </div>
      </section>


    </main>
  );
};

export default PlantIdentificationAppPage;
