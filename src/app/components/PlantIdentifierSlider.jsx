"use client";
import dynamic from "next/dynamic";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Dynamically import react-slick with SSR disabled
const Slider = dynamic(() => import("react-slick"), {
  ssr: false, // Disable server-side rendering
});

const PlantIdentifierSlider = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    rtl: false,
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] sm:min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Slider {...sliderSettings} className="w-full max-w-[1440px]">
        {/* Slide 1: Plant Identification */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
            <div className="flex-1 space-y-4 sm:space-y-6 max-w-lg">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:text-left">
                Instantly Identify Any Plant
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-center lg:text-left">
                Recognize plants from around the world by picture with accuracy
                and confidence in just a few taps – featuring innovative ML
                technologies, an extensive database, and ID guidance.
              </p>
              <button className="bg-teal-700 text-white py-2 sm:py-3 px-6 w-full sm:w-60 rounded-full text-sm sm:text-base">
                Identify a Plant
              </button>
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <img
                  src="https://myplantin.com/icons/qr-code.svg"
                  alt="QR Code"
                  className="w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24"
                />
                <div className="flex flex-col gap-2">
                  <a
                    href="https://apps.apple.com/us/app/plantin-plant-identifier-care/id1527399597"
                    aria-label="Download on the App Store"
                  >
                    <img
                      src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                      alt="Download on the App Store"
                      className="h-8 sm:h-10"
                    />
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.plantin.app"
                    aria-label="Get it on Google Play"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      className="h-8 sm:h-10"
                    />
                  </a>
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-lg">
              <img
                src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FHomepage_illustrations_1_c73c829a78.webp&w=3840&q=75"
                alt="Plant Identification"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* Slide 2: Plant Disease Diagnosis */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
            <div className="flex-1 space-y-4 sm:space-y-6 max-w-lg">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:text-left">
                What's Wrong with Your Plant?
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-center lg:text-left">
                Become a proud owner of a healthy plant. Just scan your plants,
                identify the disease type, and treat any sick greenery with the
                help of our botanist experts and in-depth guides.
              </p>
              <button className="bg-teal-700 text-white py-2 sm:py-3 px-6 w-full sm:w-60 rounded-full text-sm sm:text-base">
                Diagnose Plant Problem
              </button>
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <img
                  src="https://myplantin.com/icons/qr-code.svg"
                  alt="QR Code"
                  className="w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24"
                />
                <div className="flex flex-col gap-2">
                  <a
                    href="https://apps.apple.com/us/app/plantin-plant-identifier-care/id1527399597"
                    aria-label="Download on the App Store"
                  >
                    <img
                      src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                      alt="Download on the App Store"
                      className="h-8 sm:h-10"
                    />
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.plantin.app"
                    aria-label="Get it on Google Play"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      className="h-8 sm:h-10"
                    />
                  </a>
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-lg">
              <img
                src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FHomepage_illustrations_2_ada517818f.webp&w=3840&q=75"
                alt="Plant Disease Diagnosis"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* Slide 3: Plant Care Plan */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
            <div className="flex-1 space-y-4 sm:space-y-6 max-w-lg">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:text-left">
                Get a Plant Care Plan & Tools
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-center lg:text-left">
                Boost your plant growth and simplify care with PlantIn's tools
                and plans: schedule maintenance tasks, set reminders, take
                notes, and track your progress.
              </p>
              <button className="bg-teal-700 text-white py-2 sm:py-3 px-6 w-full sm:w-60 rounded-full text-sm sm:text-base">
                Start Your Plant Care
              </button>
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <img
                  src="https://myplantin.com/icons/qr-code.svg"
                  alt="QR Code"
                  className="w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24"
                />
                <div className="flex flex-col gap-2">
                  <a
                    href="https://apps.apple.com/us/app/plantin-plant-identifier-care/id1527399597"
                    aria-label="Download on the App Store"
                  >
                    <img
                      src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                      alt="Download on the App Store"
                      className="h-8 sm:h-10"
                    />
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.plantin.app"
                    aria-label="Get it on Google Play"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      className="h-8 sm:h-10"
                    />
                  </a>
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-lg">
              <img
                src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FHomepage_illustrations_6938f202fd.webp&w=3840&q=75"
                alt="Plant Care Plan"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </Slider>
    </div>
  );
};

export default PlantIdentifierSlider;