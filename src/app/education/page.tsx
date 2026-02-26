import React from 'react';

const ElchEducation: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="w-full bg-gray-900 py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white-800">Elch</div>
          <nav className="flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-800">Education</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">Feed</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">Blog</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">About us</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl bg-darkgray mx-auto px-4 py-8 text-center">
        {/* Timestamp (mimicking PDF) */}
        <p className="text-sm text-white mb-4">5/18/25, 10:24 PM</p>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-white mb-4">
          Elch for Educational organizations
        </h1>

        {/* Form */}
        <div className="mb-12">
          <p className="text-lg text-white mb-4">
            Enter your organization's email to check access
          </p>
          <input
            type="email"
            placeholder="alumni@stanford.edu"
            className="w-full max-w-md p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
          <button className="w-full max-w-md bg-white text-black p-2 rounded hover:bg-gray-900">
            Check
          </button>
        </div>

        {/* How to Use Section */}
        <h2 className="text-2xl font-semibold text-white mb-4">
          How to use Elch for your edu goals?
        </h2>
        <p className="text-lg text-white mb-8">
          Do you want to grow both plants and your own personal knowledge? Download Elch to get full access to all the tools and features needed for indoor and outdoor gardening.
        </p>

        {/* Features List */}
        <div className="space-y-6 text-left">
          <div>
            <h3 className="text-xl font-medium text-white">Accurate Plant Identifier</h3>
            <p className="text-white">
              Find out names for flowers, succulents, mushrooms, etc. instantly with Elch's ML-trained Identifier
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-white">Precise Disease Diagnosis</h3>
            <p className="text-white">
              Use innovative AI technology to diagnose your sick plant in seconds & get a personalized care plan.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-white">Full Plant List with Care Tips & Info</h3>
            <p className="text-white">
              Find and add plants to your app home from a HUGE Base of Plants to learn more about them
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-white">Virtual Plant Care Tools</h3>
            <p className="text-white">
              Use the Watering Calculator, Water Reminder, and Light Meter features to measure exactly how much water or light your greenie needs.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-whit">Toxicity Checker</h3>
            <p className="text-white">
              Instantly find out if the plant is dangerous for you or your pets.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-white">Plant Parent Community</h3>
            <p className="text-white">
              Read the blog, get advice, and share your planting experience with others.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-white">Plant Growing Guides and Tips</h3>
            <p className="text-white">
              Every greenie gets its own individualized plant care plan based on the Moon Calendar, Weather and Climate.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-white">24/7 Plant Ambulance</h3>
            <p className="text-white">
              The expert botanists are on the hotline to answer all plant-related questions and concerns
            </p>
          </div>
        </div>

        {/* Page Indicator (mimicking PDF) */}
        <p className="text-sm text-white mt-4">$1 / 2$</p>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-900 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center space-x-2 mb-2">
            <a href="#" className="text-white hover:underline">Privacy</a>
            <span className="text-white">-</span>
            <a href="#" className="text-white hover:underline">Terms</a>
          </div>
          <p className="text-white">Elch. Copyright 2024</p>
          <a
            href="https://myplantin.com/education"
            className="text-white hover:underline"
          >
            https://myplantin.com/education
          </a>
          <p className="text-sm text-white mt-2">$2 / 2$</p>
        </div>
      </footer>
    </div>
  );
};

export default ElchEducation;