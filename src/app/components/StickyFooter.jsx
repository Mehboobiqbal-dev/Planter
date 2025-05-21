"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';

const StickyFooter = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-[95%] max-w-3xl sm:max-w-4xl bg-green-100 rounded-xl shadow-lg px-4 sm:px-6 py-3 sm:py-4 flex justify-center sm:justify-between items-center gap-3 sm:gap-4 z-50">
      {/* Message - hidden on mobile */}
      <p className="hidden sm:block text-lg lg:text-xl font-semibold text-black text-left">
        Identify, get care & grow healthy plants with ease!
      </p>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Start Now button - visible only on mobile */}
        <button className="block sm:hidden bg-gradient-to-r from-teal-400 to-green-400 text-white font-semibold px-4 py-1.5 rounded-full shadow-md hover:opacity-90 transition-all text-sm">
          Start Now
        </button>

        {/* Start Now button - visible only on desktop */}
        <button className="hidden sm:block bg-gradient-to-r from-teal-400 to-green-400 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:opacity-90 transition-all text-base">
          Start Now
        </button>

        {/* Close button - hidden on mobile */}
        <button
          onClick={() => setIsVisible(false)}
          className="hidden sm:block text-black hover:text-red-500 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default StickyFooter;
