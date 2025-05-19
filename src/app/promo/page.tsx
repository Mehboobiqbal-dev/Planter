import React from 'react';

const PlantinPromo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900
 flex flex-col">
      {/* Header */}
      <header className="w-full bg-gray-900 border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">Plantin</div>
          <nav className="flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-800">Promo</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">Feed</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">Blog</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">About us</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 text-center">
        {/* Promo Code Section */}
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          Use Your Plantin Promo Code
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          To get exclusive access to the world's largest plant lovers community
        </p>
        <div className="mb-12">
          <input
            type="email"
            placeholder="Email"
            className="w-full max-w-md p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
          <input
            type="text"
            placeholder="Promo code"
            className="w-full max-w-md p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
          <button className="w-full max-w-md bg-gray-800 text-white p-2 rounded hover:bg-gray-900">
            Activate
          </button>
        </div>

        {/* How It Works Section */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          How does the Plantin promo code work?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Enter your promo code and get full exclusive access for free
        </p>

        {/* Features List */}
        <div className="space-y-6 text-left">
          <div>
            <h3 className="text-xl font-medium text-gray-800">Accurate Plant Identifier</h3>
            <p className="text-gray-600">
              Find out names for flowers, succulents, mushrooms, etc. instantly with Plantin's ML-trained Identifier
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-800">Precise Disease Diagnosis</h3>
            <p className="text-gray-600">
              Use innovative AI technology to diagnose your sick plant in seconds & get a personalized care plan.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-800">Full Plant List with Care Tips & Info</h3>
            <p className="text-gray-600">
              Find and add plants to your app home from a HUGE Base of Plants to learn more about them
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-800">Virtual Plant Care Tools</h3>
            <p className="text-gray-600">
              Use the Watering Calculator, Water Reminder, and Light Meter features to measure exactly how much water or light your greenie needs.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-800">Toxicity Checker</h3>
            <p className="text-gray-600">
              Instantly find out if the plant is dangerous for you or your pets.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-800">Plant Parent Community</h3>
            <p className="text-gray-600">
              Read the blog, get advice, and share your planting experience with others.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-800">Plant Growing Guides and Tips</h3>
            <p className="text-gray-600">
              Every greenie gets its own individualized plant care plan based on the Moon Calendar, Weather and Climate.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-800">24/7 Plant Ambulance</h3>
            <p className="text-gray-600">
              The expert botanists are on the hotline to answer all plant-related questions and concerns
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600">Plantin. Copyright 2024</p>
          <a
            href="https://myplantin.com/promo"
            className="text-gray-600 hover:underline"
          >
            https://myplantin.com/promo
          </a>
        </div>
      </footer>
    </div>
  );
};

export default PlantinPromo;