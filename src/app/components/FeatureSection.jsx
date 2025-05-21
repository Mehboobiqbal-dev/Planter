import React from 'react';

export function FeatureSection() {
  return (
    <>
      {/* Section 1: Boost Plant Growth */}
      <section className="flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mx-auto max-w-[1320px] gap-6 lg:gap-12">
        <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:text-left">
            Boost Plant Growth & Thrive
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-center lg:text-left">
            Get personalized care plans based on your plant’s needs and environment. Provide your plants the right care at the right time with real-time data and expert insights, ensuring they grow healthy and strong.
          </p>
          <button className="bg-teal-700 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-teal-800 transition duration-200 w-full sm:w-auto text-sm sm:text-base">
            Get Cared Tools
          </button>
        </div>
        <div className="flex-1">
          <img
            src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fhome_plant_growth_3bb0198042.webp&w=1920&q=75"
            alt="Boost Plant Growth"
            className="w-full sm:w-3/4 lg:w-2/3 h-auto object-cover rounded-lg mx-auto"
          />
        </div>
      </section>

      {/* Section 2: Grow Healthy Plants */}
      <section className="flex flex-col lg:flex-row-reverse items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mx-auto max-w-[1320px] gap-6 lg:gap-12">
        <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:text-left">
            Grow Healthy Plants
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-center lg:text-left">
            Prevent plant diseases with our advanced diagnostic tool. Detect issues early with our innovative ML-model and a vast database of plant symptoms, giving your plants the care they need to stay healthy and flourish.
          </p>
          <button className="bg-teal-700 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-teal-800 transition duration-200 w-full sm:w-auto text-sm sm:text-base">
            Diagnose a Plant
          </button>
        </div>
        <div className="flex-1">
          <img
            src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fhome_healthy_plants_b28cedec47.webp&w=1920&q=75"
            alt="Grow Healthy Plants"
            className="w-full sm:w-3/4 lg:w-2/3 h-auto object-cover rounded-lg mx-auto"
          />
        </div>
      </section>

      {/* Section 3: Save Plants with Expert Help */}
      <section className="flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mx-auto max-w-[1320px] gap-6 lg:gap-12">
        <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:text-left">
            Save Your Plants with Expert Help
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-center lg:text-left">
            Bring your plants back to life with direct advice from a real botanist. Get tailored guidance for any plant issue — whether it’s pests, diseases, or general decline — and watch your plant bounce back stronger than ever.
          </p>
          <button className="bg-teal-700 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-teal-800 transition duration-200 w-full sm:w-auto text-sm sm:text-base">
            Get Botanist Help
          </button>
        </div>
        <div className="flex-1">
          <img
            src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fhome_expert_help_b0d533886d.webp&w=1920&q=75"
            alt="Save Your Plants with Expert Help"
            className="w-full sm:w-3/4 lg:w-2/3 h-auto object-cover rounded-lg mx-auto"
          />
        </div>
      </section>

      {/* Section 4: Enhance Mushroom Hunts */}
      <section className="flex flex-col lg:flex-row-reverse items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mx-auto max-w-[1320px] gap-6 lg:gap-12">
        <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:text-left">
            Enhance Your Mushroom Hunts
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-center lg:text-left">
            Take your mushroom foraging to the next level with our quick and easy identification tool. Spot new fungi and get fast, reliable info on what you’ve found, making every hunt more exciting and rewarding.
          </p>
          <button className="bg-teal-700 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-teal-800 transition duration-200 w-full sm:w-auto text-sm sm:text-base">
            Identify Mushrooms
          </button>
        </div>
        <div className="flex-1">
          <img
            src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fhome_mushroom_hunts_dce5e2c424.webp&w=1920&q=75"
            alt="Enhance Your Mushroom Hunts"
            className="w-full sm:w-3/4 lg:w-2/3 h-auto object-cover rounded-lg mx-auto"
          />
        </div>
      </section>

      {/* Section 5: Resolve Fungal Problems */}
      <section className="flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mx-auto max-w-[1320px] gap-6 lg:gap-12">
        <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:text-left">
            Resolve Any Fungal Problems
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-center lg:text-left">
            Get expert mycologist advice for any fungi-related concerns. Whether it’s identifying an unfamiliar species or resolving a problem with edible mushrooms, our specialists provide accurate, tailored solutions, ensuring you feel confident and informed throughout your foraging journey.
          </p>
          <button className="bg-teal-700 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-teal-800 transition duration-200 w-full sm:w-auto text-sm sm:text-base">
            Get Mycologist Help
          </button>
        </div>
        <div className="flex-1">
          <img
            src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fhome_fungal_problems_33c01fb0aa.webp&w=1920&q=75"
            alt="Resolve Any Fungal Problems"
            className="w-full sm:w-3/4 lg:w-2/3 h-auto object-cover rounded-lg mx-auto"
          />
        </div>
      </section>

      {/* Section 6: Join Plant Community */}
      <section className="flex flex-col lg:flex-row-reverse items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mx-auto max-w-[1320px] gap-6 lg:gap-12">
        <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:text-left">
            Join a Global Plant Community
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-center lg:text-left">
            Become a part of our thriving global plant community and connect with passionate plant lovers from around the world. Share tips, exchange advice, and learn from fellow gardeners, making plant care a collaborative and rewarding experience. Discover new ideas and grow together!
          </p>
          <button className="bg-teal-700 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-teal-800 transition duration-200 w-full sm:w-auto text-sm sm:text-base">
            Join The Plant Club
          </button>
        </div>
        <div className="flex-1">
          <img
            src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fhome_plant_community_986be4664e.webp&w=1920&q=75"
            alt="Join a Global Plant Community"
            className="w-full sm:w-3/4 lg:w-2/3 h-auto object-cover rounded-lg mx-auto"
          />
        </div>
      </section>
    </>
  );
}