// File: app/authmodel/page.tsx
'use client';

import React, { useCallback, useState, useEffect } from 'react'; // Added useEffect
import { FaApple, FaGoogle, FaFacebookF } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  setEmail,
  setPassword,
  setConfirmPassword,
  setName,
  setForgotEmail,
  setError,
  setForgotMessage,
  setTermsAccepted,
  setNotificationsAccepted,
  setIsLoading,
  setActiveTab,
  setShowForgotPassword,
  resetAuthState,
} from '../redux/slices/authSlice'; // Verify path: e.g., ../../redux/slices/authSlice
import { RootState } from '../redux/types'; // Verify path: e.g., ../../redux/types

const AuthModalPage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [formError, setFormError] = useState<string>('');
  const {
    email,
    password,
    confirmPassword,
    name,
    forgotEmail,
    error, // Redux error state
    forgotMessage,
    termsAccepted,
    notificationsAccepted,
    isLoading,
    activeTab,
    showForgotPassword,
  } = useSelector((state: RootState) => state.auth);

  const isValidEmail = useCallback((emailString: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailString);
  }, []);

  useEffect(() => {
    setFormError(''); // Clear local form error when relevant state changes
    dispatch(setError('')); // Clear Redux error when tab or view changes
  }, [activeTab, showForgotPassword, dispatch]);

  const handleSignIn = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFormError('');
    if (!isValidEmail(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    dispatch(setError(''));
    dispatch(setIsLoading(true));

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        console.error('Sign-in error from NextAuth:', result.error);
        const errorMessage = result.error.includes('CredentialsSignin') || result.error.includes('Invalid email or password')
          ? 'Incorrect email or password. Please try again.'
          : result.error.includes('NetworkError')
          ? 'Network error: Unable to connect to the authentication server.'
          : 'Sign-in failed. Please try again later.';
        dispatch(setError(errorMessage));
      } else if (result?.ok && !result.error) {
        dispatch(resetAuthState());
        router.push('/');
      } else {
        dispatch(setError('Sign-in attempt failed. Please try again.'));
      }
    } catch (err: unknown) {
      console.error('Unexpected error during sign-in process:', err);
      dispatch(setError('An unexpected error occurred during sign-in.'));
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, email, password, router, isValidEmail]);

  const handleSignUp = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) {
        setFormError('Please enter your name.');
        return;
    }
    if (!isValidEmail(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setFormError('You must agree to the policies to sign up.');
      return;
    }

    dispatch(setError(''));
    dispatch(setIsLoading(true));

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Sign-up API error response:', data);
        dispatch(setError(data.error || `Sign-up failed (Status: ${response.status}).`));
        return;
      }

      // If custom registration is successful, proceed to sign in with NextAuth
      console.log('Custom registration successful, attempting NextAuth sign-in.');
      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        console.error('Auto sign-in after sign-up failed:', signInResult.error);
        dispatch(setError('Sign-up was successful, but auto sign-in failed. Please sign in manually.'));
        // Optionally, switch to sign-in tab:
        // dispatch(setActiveTab('signin'));
      } else if (signInResult?.ok) {
        dispatch(resetAuthState());
        router.push('/');
      } else {
        dispatch(setError('Sign-up successful, but auto sign-in encountered an issue. Please sign in.'));
      }
    } catch (err: unknown) {
      console.error('Unexpected error during sign-up process:', err);
      const fetchError = err instanceof Error && err.message.toLowerCase().includes('failed to fetch');
      dispatch(setError(
        fetchError
          ? 'Network error: Unable to reach the sign-up server.'
          : 'An unexpected error occurred during sign-up.'
      ));
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, email, password, confirmPassword, name, termsAccepted, router, isValidEmail]);

  const handleForgotPassword = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFormError('');
    if (!forgotEmail) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(forgotEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    dispatch(setError(''));
    dispatch(setForgotMessage(''));
    dispatch(setIsLoading(true));

    try {
      const response = await fetch('/api/forgetpassword', { // Ensure this endpoint exists
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Forgot password API error:', data);
        dispatch(setError(data.error || `Failed to send reset link (Status: ${response.status}).`));
      } else {
        dispatch(setForgotMessage(data.message || 'If an account exists for this email, a reset link has been sent.'));
        dispatch(setForgotEmail(''));
      }
    } catch (err: unknown) {
      console.error('Forgot password fetch error:', err);
      dispatch(setError('Failed to connect to the server. Please check your network.'));
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, forgotEmail, isValidEmail]);

  const handleSocialSignIn = useCallback(async (provider: string) => {
    dispatch(setError(''));
    dispatch(setIsLoading(true));
    try {
      const result = await signIn(provider, { redirect: false, callbackUrl: '/' });
      if (result?.error) {
        console.error(`Social sign-in error (${provider}):`, result.error);
        const errorMessage = result.error.includes('OAuthAccountNotLinked')
          ? 'This social account may be linked to another user, or you may have previously signed in with a different method using this email.'
          : result.error.includes('NetworkError')
          ? `Network error: Unable to connect with ${provider}.`
          : `Failed to sign in with ${provider}. Please try another method or contact support.`;
        dispatch(setError(errorMessage));
      } else if (result?.ok) {
        dispatch(resetAuthState());
        // router.push('/'); // signIn with callbackUrl should handle redirect
      } else if (!result?.url) { // If no error but no URL, something unexpected happened
        dispatch(setError(`Sign-in with ${provider} did not complete as expected. Please try again.`));
      }
    } catch (err: unknown) {
      console.error(`Unexpected social sign-in error (${provider}):`, err);
      dispatch(setError(`An unexpected error occurred during ${provider} sign-in.`));
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, router]);

  const currentError = formError || error; // Display local form error first, then Redux error

  return (
    <div className="flex min-h-screen relative font-sans bg-gray-100">
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
        aria-label="Close"
        onClick={() => router.push('/')}
      >
        <IoClose size={24} />
      </button>

      <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6 min-h-screen px-4 sm:px-8 md:px-12 bg-white overflow-y-auto py-10">
        <div className="flex border-b-2 border-gray-200 mb-8">
          <button
            onClick={() => { dispatch(setActiveTab('signin')); dispatch(setShowForgotPassword(false)); }}
            className={`flex-1 text-center py-3 font-semibold transition-colors ${
              activeTab === 'signin' && !showForgotPassword
                ? 'text-green-500 border-b-4 border-green-500'
                : 'text-gray-500 hover:text-green-500'
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => { dispatch(setActiveTab('signup')); dispatch(setShowForgotPassword(false)); }}
            className={`flex-1 text-center py-3 font-semibold transition-colors ${
              activeTab === 'signup' && !showForgotPassword
                ? 'text-green-500 border-b-4 border-green-500'
                : 'text-gray-500 hover:text-green-500'
            }`}
          >
            Sign up
          </button>
        </div>

        {currentError && (
          <div className="text-red-600 text-center mb-4 font-medium p-3 bg-red-100 border border-red-300 rounded-md text-sm">
            {currentError}
          </div>
        )}
        {forgotMessage && !currentError && (
          <div className="text-green-600 text-center mb-4 font-medium p-3 bg-green-100 border border-green-300 rounded-md text-sm">
            {forgotMessage}
          </div>
        )}

        <div className="flex space-x-2 sm:space-x-4 mb-8">
          <button
            onClick={() => handleSocialSignIn('apple')}
            className="flex-1 h-12 border border-gray-300 rounded-lg flex items-center justify-center text-2xl text-gray-700 hover:bg-gray-100 disabled:opacity-60 transition-colors"
            disabled={isLoading}
            aria-label="Sign in with Apple"
          >
            <FaApple />
          </button>
          <button
            onClick={() => handleSocialSignIn('google')}
            className="flex-1 h-12 border border-gray-300 rounded-lg flex items-center justify-center text-2xl text-gray-700 hover:bg-gray-100 disabled:opacity-60 transition-colors"
            disabled={isLoading}
            aria-label="Sign in with Google"
          >
            <FaGoogle />
          </button>
          <button
            onClick={() => handleSocialSignIn('facebook')}
            className="flex-1 h-12 border border-gray-300 rounded-lg flex items-center justify-center text-2xl text-gray-700 hover:bg-gray-100 disabled:opacity-60 transition-colors"
            disabled={isLoading}
            aria-label="Sign in with Facebook"
          >
            <FaFacebookF />
          </button>
        </div>

        <div className="flex items-center mb-8">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-gray-500 text-sm">Or</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        {showForgotPassword ? (
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="forgot-email" className="block font-semibold mb-1 text-left text-sm">
                Enter your email <span className="text-red-500">*</span>
              </label>
              <input
                id="forgot-email"
                type="email"
                placeholder="email@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 text-sm"
                value={forgotEmail}
                onChange={(e) => dispatch(setForgotEmail(e.target.value.trim()))}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full bg-green-400 text-white py-3 rounded-full font-semibold text-lg hover:bg-green-500 focus:outline-none disabled:opacity-60 flex items-center justify-center transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
            <button
              type="button"
              onClick={() => dispatch(setShowForgotPassword(false))}
              className="text-sm text-gray-600 hover:underline w-full text-center mt-2"
              disabled={isLoading}
            >
              Back to Sign In
            </button>
          </form>
        ) : activeTab === 'signin' ? (
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="signin-email" className="block font-semibold mb-1 text-left text-sm">
                Enter your email <span className="text-red-500">*</span>
              </label>
              <input
                id="signin-email"
                type="email"
                placeholder="email@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 text-sm"
                value={email}
                onChange={(e) => dispatch(setEmail(e.target.value.trim()))}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="signin-password" className="block font-semibold text-left text-sm">
                  Enter password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  className="text-xs text-gray-600 hover:underline"
                  onClick={() => dispatch(setShowForgotPassword(true))}
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="signin-password"
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 text-sm"
                value={password}
                onChange={(e) => dispatch(setPassword(e.target.value))}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="button"
              onClick={handleSignIn}
              className="w-full bg-gradient-to-r from-green-400 to-green-300 text-white py-3 rounded-full font-semibold text-lg hover:from-green-500 hover:to-green-400 focus:outline-none disabled:opacity-60 flex items-center justify-center transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        ) : ( // activeTab === 'signup'
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="signup-name" className="block font-semibold mb-1 text-sm">
                Enter your name <span className="text-red-500">*</span>
              </label>
              <input
                id="signup-name"
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 text-sm"
                value={name}
                onChange={(e) => dispatch(setName(e.target.value))} // Allow spaces in name, trim later if needed
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="block font-semibold mb-1 text-sm">
                Enter your email <span className="text-red-500">*</span>
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="email@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 text-sm"
                value={email}
                onChange={(e) => dispatch(setEmail(e.target.value.trim()))}
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="w-full sm:w-1/2">
                <label htmlFor="signup-password"className="block font-semibold mb-1 text-sm">
                  Enter password <span className="text-red-500">*</span>
                </label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="Password (min 6 chars)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 text-sm"
                  value={password}
                  onChange={(e) => dispatch(setPassword(e.target.value))}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label htmlFor="signup-confirm-password"className="block font-semibold mb-1 text-sm">
                  Confirm password <span className="text-red-500">*</span>
                </label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 text-sm"
                  value={confirmPassword}
                  onChange={(e) => dispatch(setConfirmPassword(e.target.value))}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex items-start space-x-3 pt-2">
              <input
                id="terms-accepted"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => dispatch(setTermsAccepted(e.target.checked))}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-400 disabled:opacity-70"
                disabled={isLoading}
              />
              <label htmlFor="terms-accepted" className="text-xs text-gray-600">
                I agree to the{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-green-500 font-medium hover:underline">
                  Privacy Policy, Terms of Service
                </a>{' '}
                and{' '}
                <a href="/subscription" target="_blank" rel="noopener noreferrer" className="text-green-500 font-medium hover:underline">
                  Subscription Policy
                </a>
              </label>
            </div>
            <div className="flex items-start space-x-3">
              <input
                id="notifications-accepted"
                type="checkbox"
                checked={notificationsAccepted}
                onChange={(e) => dispatch(setNotificationsAccepted(e.target.checked))}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-400 disabled:opacity-70"
                disabled={isLoading}
              />
              <label htmlFor="notifications-accepted" className="text-xs text-gray-600">
                I agree to receive important notifications and updates via email
              </label>
            </div>
            <button
              type="button"
              onClick={handleSignUp}
              className="w-full bg-green-400 text-white py-3 rounded-full font-semibold text-lg hover:bg-green-500 focus:outline-none disabled:opacity-60 flex items-center justify-center transition-colors"
              disabled={isLoading || !termsAccepted}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Signing up...
                </>
              ) : (
                'Sign up'
              )}
            </button>
          </form>
        )}
      </div>

      <div
        className="hidden md:flex w-1/2 flex-col justify-center items-center space-y-6 min-h-screen px-12 bg-teal-300 text-center"
        style={{
          backgroundImage: `url('https://strapi.myplantin.com/Sign_up_Illustration_6a13a81c32.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {activeTab === 'signin' && !showForgotPassword ? (
          <div className="p-8 bg-white/70 backdrop-blur-md rounded-lg shadow-xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-4">
              Having troubles with your plants? Ask the botanist!
            </h2>
            <p className="text-xl text-gray-700 mb-6">To get a personalized answer:</p>
            <ul className="m-0 p-0 text-lg list-none space-y-3 text-left">
              <li className="flex items-start">
                <span className="text-2xl text-green-600 font-bold mr-3">•</span>
                <span className="font-semibold text-gray-700">Use botanist help feature</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl text-green-600 font-bold mr-3">•</span>
                <span className="font-semibold text-gray-700">
                  Formulate your question & attach photos
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl text-green-600 font-bold mr-3">•</span>
                <span className="font-semibold text-gray-700">Receive an answer within 24 hours</span>
              </li>
            </ul>
          </div>
        ) : (
          <div className="p-8 bg-white/70 backdrop-blur-md rounded-lg shadow-xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-6">
              With PlantIn you can
            </h2>
            <ul className="m-0 p-0 text-lg list-none space-y-3 text-left">
              <li className="flex items-start">
                <span className="text-2xl text-green-600 font-bold mr-3">•</span>
                <span className="font-semibold text-gray-700">
                  Discover any plant in seconds
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl text-green-600 font-bold mr-3">•</span>
                <span className="font-semibold text-gray-700">
                  Become a green thumb with our blog
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl text-green-600 font-bold mr-3">•</span>
                <span className="font-semibold text-gray-700">
                  Identify and cure plant diseases
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl text-green-600 font-bold mr-3">•</span>
                <span className="font-semibold text-gray-700">
                  Get personalized help from experts
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModalPage;