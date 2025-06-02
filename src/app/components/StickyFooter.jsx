"use client";
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'stickyFooterDismissedAt';
const HIDE_DURATION_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

const StickyFooter = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissedAtTimestampString = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (dismissedAtTimestampString) {
      const dismissedAtTimestamp = parseInt(dismissedAtTimestampString, 10);
      const timeSinceDismissal = Date.now() - dismissedAtTimestamp;

      if (timeSinceDismissal < HIDE_DURATION_MS) {
        setIsVisible(false);
        // Optional: Set a timeout to make it visible again without a refresh
        // if the user keeps the tab open.
        const timeRemaining = HIDE_DURATION_MS - timeSinceDismissal;
        const timerId = setTimeout(() => {
          setIsVisible(true);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }, timeRemaining);
        // Cleanup function for the timeout
        return () => clearTimeout(timerId);
      } else {
        // Timer expired, remove the item so it shows again on next load
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setIsVisible(true);
      }
    } else {
      setIsVisible(true); // Default to visible if never dismissed
    }
  }, []); // Empty dependency array ensures this runs only on mount

  const handleClose = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, Date.now().toString());
    setIsVisible(false);
    // Note: If you want the timeout to re-show it without refresh after 10 mins
    // even if closed now, you'd add that logic here as well.
    // For simplicity, this version relies on page load/refresh after 10 mins,
    // or the timeout set in useEffect if it was already hidden on load.
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile View: Small Start Now button box */}
      <div className="sm:hidden fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50">
        <button className="block text-headline text-center rounded-[30px] font-semibold p-3.5 min-w-[332px] w-full text-white bg-gradient-to-r from-[#04BF94] to-[#52C8AD] hover:from-[#06D3A4] hover:to-[#60E7C8] max-w-[500px] mx-auto py-3">
          Start Now
        </button>
      </div>

      {/* Desktop View: Full Sticky Footer */}
      <div className="hidden sm:flex fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[95%] max-w-4xl bg-green-100 rounded-xl shadow-lg px-6 py-4 justify-between items-center gap-4 z-50">
        {/* Message */}
        <p className="text-lg lg:text-xl font-semibold text-black text-left">
          Identify, get care & grow healthy plants with ease!
        </p>

        <div className="flex items-center gap-3">
          {/* Start Now button */}
          <button className="bg-gradient-to-r from-teal-400 to-green-400 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:opacity-90 transition-all text-base">
            Start Now
          </button>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="text-black hover:text-red-500 transition-all"
            aria-label="Close sticky footer" // Added for accessibility
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default StickyFooter;