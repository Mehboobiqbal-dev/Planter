import React from 'react';
import { FaInstagram, FaFacebookF, FaPinterestP, FaTiktok } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-white text-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Mobile View */}
        <div className="lg:hidden text-center">
          <div className="max-w-lg mx-auto">
            {/* Show Full Menu Button */}
            <button className="text-slate-600 font-semibold text-sm mb-8 hover:text-slate-700 transition-colors">
              Show full menu
            </button>

            {/* Get Our App Heading */}
            <h2 className="font-bold text-xl text-black mb-6">
              Get our app
            </h2>

            {/* App Store and Google Play Buttons */}
            <div className="flex flex-col items-center space-y-4 mb-8">
              <a 
                href="#" 
                aria-label="Download on the App Store"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on the App Store"
                  className="h-12 w-auto sm:h-14"
                />
              </a>
              <a 
                href="#" 
                aria-label="Get it on Google Play"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png"
                  alt="Get it on Google Play"
                  className="h-12 w-auto sm:h-14"
                />
              </a>
            </div>

            {/* Social Media Icons */}
            <div className="flex justify-center space-x-5 sm:space-x-6 mb-8 text-black">
              <a 
                href="#" 
                aria-label="Instagram" 
                className="hover:text-gray-600 transition-colors text-3xl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a 
                href="#" 
                aria-label="Facebook" 
                className="hover:text-gray-600 transition-colors text-3xl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebookF />
              </a>
              <a 
                href="#" 
                aria-label="Pinterest" 
                className="hover:text-gray-600 transition-colors text-3xl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaPinterestP />
              </a>
              <a 
                href="#" 
                aria-label="TikTok" 
                className="hover:text-gray-600 transition-colors text-3xl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTiktok />
              </a>
            </div>

            {/* Descriptive Text */}
            <p className="text-sm text-gray-700 leading-relaxed px-2">
              Our plant identifier with database of more than 17,000 species is also the
              best place to Ask the Botanist, get plant watering recommendations, adjust
              your plant care schedule, try disease identification, and much more!
            </p>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src="https://myplantin.com/_next/static/media/logo.3707044a.svg"
                alt="PlantIn logo"
                className="h-6 w-6 sm:h-8 sm:w-8"
              />
              <span className="text-lg sm:text-xl font-bold">PlantIn</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              Our plant identifier with database of more than 17,000 species is also the
              best place to Ask the Botanist, get plant watering recommendations, adjust
              your plant care schedule, try disease identification, and much more!
            </p>
            <address className="not-italic text-xs sm:text-sm">
              Florinis 7, Greg Tower,<br />
              2nd Floor, 1065,<br />
              Nicosia, Cyprus
            </address>
          </div>

          {/* Plants Care Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm sm:text-base">Plants Care</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { label: 'Plant Identifier', path: '/identify' },
                { label: 'Plant Problems', path: '/problems' },
                { label: 'Blog', path: '/blog' },
                { label: 'Ask the Botanist', path: '/ask-the-botanist' },
                { label: 'Weed Community', path: '/problems/weeds' },
              ].map(item => (
                <li key={item.label}>
                  <a href={item.path} className="hover:underline hover:text-green-600">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm sm:text-base">Company</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { label: 'About Us', path: '/about-us' },
                { label: 'PlantIn App Review', path: '/plantinapp' },
                { label: 'Ratings and Reviews', path: '/review' },
                { label: 'Hero of Ukraine', path: '/' },
                { label: 'FAQ', path: '/faq' },
                { label: 'Contact Us', path: '/contact-us' },
                { label: 'Subscription', path: '/subscription' },
              ].map(item => (
                <li key={item.label}>
                  <a href={item.path} className="hover:underline hover:text-green-600">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Terms and Conditions Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm sm:text-base">Terms and Conditions</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { name: 'Terms of Service', link: '/review' },
                { name: 'Money Back Policy', link: '/money-back-guarantee' },
                { name: 'Subscription Policy', link: '/subscription-policy' },
                { name: 'Privacy Policy', link: '/do-not-sell' },
                { name: 'Cookie Settings', link: '/settings' },
                { name: 'Do Not Sell My Personal Data', link: '/do-not-sell' },
              ].map(item => (
                <li key={item.name}>
                  <a href={item.link} className="hover:underline hover:text-green-600">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Our App Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm sm:text-base">Get Our App</h3>
            <div className="space-y-2">
              <a href="#" aria-label="Download on the App Store">
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  className="h-8 sm:h-10"
                  alt="Download on the App Store"
                />
              </a>
              <a href="#" aria-label="Get it on Google Play">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  className="h-8 sm:h-10"
                  alt="Get it on Google Play"
                />
              </a>
            </div>
            <div className="flex space-x-4 mt-4 text-xl sm:text-2xl">
              <a href="#" aria-label="Instagram" className="hover:text-green-600">
                <FaInstagram />
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-green-600">
                <FaFacebookF />
              </a>
              <a href="#" aria-label="Pinterest" className="hover:text-green-600">
                <FaPinterestP />
              </a>
              <a href="#" aria-label="TikTok" className="hover:text-green-600">
                <FaTiktok />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 text-center sm:text-left">
            Identify, get care & grow healthy plants with ease!
          </h2>
          <a
            href="#"
            className="inline-block bg-gradient-to-r from-green-400 to-green-500 text-white font-medium rounded-full px-4 sm:px-6 py-2 sm:py-3 hover:opacity-90 transition text-sm sm:text-base"
          >
            Get access
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;