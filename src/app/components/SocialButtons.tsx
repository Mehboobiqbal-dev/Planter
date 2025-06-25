import React from 'react';
import { FaApple, FaGoogle, FaFacebookF } from 'react-icons/fa';

interface SocialSignInButtonsProps {
  onSocialSignIn: (provider: string) => void;
  isLoading: boolean;
}

const SocialSignInButtons: React.FC<SocialSignInButtonsProps> = ({ onSocialSignIn, isLoading }) => {
  return (
    <div className="flex space-x-3 sm:space-x-4 mb-6 sm:mb-8">
      <button
        onClick={() => onSocialSignIn('apple')}
        className="flex-1 h-11 sm:h-12 border border-gray-300 rounded-lg flex items-center justify-center text-xl sm:text-2xl text-black hover:bg-gray-50 disabled:opacity-60 transition-colors"
        disabled={isLoading}
        aria-label="Sign in with Apple"
      >
        <FaApple />
      </button>
      <button
        onClick={() => onSocialSignIn('google')}
        className="flex-1 h-11 sm:h-12 border border-gray-300 rounded-lg flex items-center justify-center text-xl sm:text-2xl text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
        disabled={isLoading}
        aria-label="Sign in with Google"
      >
        <FaGoogle />
      </button>
      <button
        onClick={() => onSocialSignIn('facebook')}
        className="flex-1 h-11 sm:h-12 border border-gray-300 rounded-lg flex items-center justify-center text-xl sm:text-2xl text-[#1877F2] hover:bg-gray-50 disabled:opacity-60 transition-colors"
        disabled={isLoading}
        aria-label="Sign in with Facebook"
      >
        <FaFacebookF />
      </button>
    </div>
  );
};

export default SocialSignInButtons;