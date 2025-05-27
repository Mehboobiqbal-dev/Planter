'use client';

import React from 'react';
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
} from '../redux/slices/authSlice'; // Adjust path if necessary
import { RootState } from '../redux/types'; // Adjust path if necessary

const AuthModal = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    email,
    password,
    confirmPassword,
    name,
    forgotEmail,
    error,
    forgotMessage,
    termsAccepted,
    notificationsAccepted,
    isLoading,
    activeTab,
    showForgotPassword,
  } = useSelector((state: RootState) => state.auth);

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle Sign-In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setError(''));
    dispatch(setIsLoading(true));

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        console.error('Sign-in error:', result.error);
        if (result.error.includes('Invalid email or password')) {
          dispatch(setError('Incorrect email or password. Please try again.'));
        } else if (result.error.includes('NetworkError')) {
          dispatch(setError('Network error: Unable to connect to authentication server.'));
        } else {
          dispatch(setError('Sign-in failed. Please try again later.'));
        }
      } else {
        dispatch(resetAuthState());
        router.push('/');
      }
    } catch (err: unknown) {
      console.error('Unexpected sign-in error:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
      dispatch(setError('An unexpected error occurred during sign-in. Please try again.'));
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  // Handle Sign-Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setError(''));
    dispatch(setIsLoading(true));

    if (password !== confirmPassword) {
      console.error('Client-side validation failed: Passwords do not match');
      dispatch(setError('Passwords do not match.'));
      dispatch(setIsLoading(false));
      return;
    }

    if (!termsAccepted) {
      console.error('Client-side validation failed: Terms not accepted');
      dispatch(setError('You must agree to the Privacy Policy, Terms of Service, and Subscription Policy.'));
      dispatch(setIsLoading(false));
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Sign-up API error:', {
          status: response.status,
          error: data.error,
          details: data.details,
        });
        if (data.error.includes('User with this email already exists')) {
          dispatch(setError('An account with this email already exists.'));
        } else if (data.error.includes('Valid email is required')) {
          dispatch(setError('Please provide a valid email address.'));
        } else if (data.error.includes('Password is required')) {
          dispatch(setError('Password must be at least 6 characters long.'));
        } else if (data.error.includes('Name is required')) {
          dispatch(setError('Please provide a valid name.'));
        } else if (data.error.includes('Request body is required')) {
          dispatch(setError('Please fill out all required fields.'));
        } else if (data.error.includes('Failed to connect to the database')) {
          dispatch(setError('Database error: Unable to process sign-up. Please try again later.'));
        } else {
          dispatch(setError(data.error || 'Failed to sign up. Please try again.'));
        }
        dispatch(setIsLoading(false));
        return;
      }

      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        console.error('Auto sign-in after sign-up failed:', signInResult.error);
        dispatch(setError('Sign-up successful, but auto sign-in failed. Please sign in manually.'));
      } else {
        dispatch(resetAuthState());
        router.push('/');
      }
    } catch (err: unknown) {
      console.error('Unexpected sign-up error:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        requestBody: { name, email, password, confirmPassword },
      });
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('Failed to fetch')) {
        dispatch(setError('Network error: Unable to reach the sign-up server.'));
      } else {
        dispatch(setError('An unexpected error occurred during sign-up. Please try again.'));
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setError(''));
    dispatch(setForgotMessage(''));
    dispatch(setIsLoading(true));

    if (!forgotEmail) {
      dispatch(setError('Please enter an email address.'));
      dispatch(setIsLoading(false));
      return;
    }

    if (!isValidEmail(forgotEmail)) {
      dispatch(setError('Please provide a valid email address.'));
      dispatch(setIsLoading(false));
      return;
    }

    const requestBody = { email: forgotEmail };
    console.log('Sending forgot password request:', requestBody);

    try {
      const response = await fetch('/api/forgetpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('Forgot password response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      const responseText = await response.text();
      console.log('Forgot password raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Forgot password response data:', data);
      } catch (jsonErr) {
        console.error('Failed to parse response as JSON:', {
          jsonError: jsonErr instanceof Error ? jsonErr.message : 'Unknown JSON error',
          responseText,
        });
        dispatch(setError('Server returned an invalid response. Please try again later.'));
        dispatch(setIsLoading(false));
        return;
      }

      if (!response.ok) {
        console.error('Forgot password API error:', {
          status: response.status,
          error: data.error,
          details: data,
        });
        dispatch(setError(data.error || `Failed to send reset link (Status: ${response.status}).`));
      } else {
        dispatch(setForgotMessage(data.message));
        dispatch(setForgotEmail(''));
      }
    } catch (err: unknown) {
      console.error('Forgot password fetch error:', {
        rawError: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        requestBody,
      });
      dispatch(setError('Failed to connect to the server. Please check your network or try again later.'));
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  // Handle Social Sign-In
  const handleSocialSignIn = async (provider: string) => {
    dispatch(setError(''));
    dispatch(setIsLoading(true));

    try {
      const result = await signIn(provider, { redirect: false });
      if (result?.error) {
        console.error(`Social sign-in error for ${provider}:`, result.error);
        if (result.error.includes('NetworkError')) {
          dispatch(setError(`Network error: Unable to connect to ${provider} authentication server.`));
        } else {
          dispatch(setError(`Failed to sign in with ${provider}. Please try again.`));
        }
      } else {
        dispatch(resetAuthState());
        router.push('/');
      }
    } catch (err: unknown) {
      console.error(`Unexpected social sign-in error for ${provider}:`, {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
      dispatch(setError(`An unexpected error occurred during ${provider} sign-in. Please try again.`));
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex flex-col items-center justify-start pt-8 sm:pt-12 pb-8 px-4 font-sans overflow-y-auto">
      <div className="relative w-full max-w-xs sm:max-w-sm">
        <button
          className="absolute -top-4 -right-3 sm:-top-2 sm:-right-2 z-20 bg-white rounded-full p-1.5 text-gray-600 shadow-md hover:bg-gray-100 hover:text-gray-800 focus:outline-none"
          aria-label="Close"
          onClick={() => router.push('/')}
        >
          <IoClose size={20} />
        </button>

        <div className="text-center mb-5">
          {/* Placeholder SVG for platform devices illustration. Replace with your actual image/SVG path */}
          <img 
  src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fweb_design_1_2f721fecd6.webp&w=256&q=75" 
  alt="description" 
  className="mx-auto h-16 w-auto mb-2" 
/>

          <p className="text-base sm:text-lg font-semibold text-gray-700">
            One solution for all the platforms
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6">
          <div className="flex mb-6 border-b border-gray-200">
            <button
              onClick={() => {
                dispatch(setActiveTab('signin'));
                dispatch(setShowForgotPassword(false));
                dispatch(setError(''));
                dispatch(setForgotMessage(''));
              }}
              className={`flex-1 text-center pb-2 pt-1 font-semibold transition-colors text-sm sm:text-base ${
                activeTab === 'signin' && !showForgotPassword
                  ? 'text-teal-500 border-b-[3px] border-teal-500'
                  : 'text-gray-500 border-b-[3px] border-transparent hover:text-teal-500'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => {
                dispatch(setActiveTab('signup'));
                dispatch(setShowForgotPassword(false));
                dispatch(setError(''));
                dispatch(setForgotMessage(''));
              }}
              className={`flex-1 text-center pb-2 pt-1 font-semibold transition-colors text-sm sm:text-base ${
                activeTab === 'signup' && !showForgotPassword
                  ? 'text-teal-500 border-b-[3px] border-teal-500'
                  : 'text-gray-500 border-b-[3px] border-transparent hover:text-teal-500'
              }`}
            >
              Sign up
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-center mb-4 text-sm font-medium">{error}</div>
          )}
          {forgotMessage && (
            <div className="text-green-600 text-center mb-4 text-sm font-medium">{forgotMessage}</div>
          )}

          {!showForgotPassword && (
            <>
              <div className="flex space-x-3 mb-6">
                <button
                  onClick={() => handleSocialSignIn('apple')}
                  className="flex-1 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  disabled={isLoading}
                  aria-label="Sign in with Apple"
                >
                  <FaApple />
                </button>
                <button
                  onClick={() => handleSocialSignIn('google')}
                  className="flex-1 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  disabled={isLoading}
                  aria-label="Sign in with Google"
                >
                  <FaGoogle />
                </button>
                <button
                  onClick={() => handleSocialSignIn('facebook')}
                  className="flex-1 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-xl text-blue-600 hover:bg-gray-50 disabled:opacity-50"
                  disabled={isLoading}
                  aria-label="Sign in with Facebook"
                >
                  <FaFacebookF />
                </button>
              </div>

              <div className="flex items-center mb-6">
                <hr className="flex-grow border-t border-gray-300" />
                <span className="mx-3 text-xs text-gray-500">Or</span>
                <hr className="flex-grow border-t border-gray-300" />
              </div>
            </>
          )}
          
          {showForgotPassword ? (
            <form className="space-y-5" onSubmit={handleForgotPassword}>
              <div>
                <label className="block text-sm font-semibold mb-1 text-left text-gray-700">
                  Enter your email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="email@email.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                  value={forgotEmail}
                  onChange={(e) => dispatch(setForgotEmail(e.target.value.trim()))}
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-teal-400 text-white py-2.5 rounded-full font-semibold text-base hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 disabled:opacity-50 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
              <button
                type="button"
                className="text-xs text-gray-600 hover:underline w-full text-center pt-1"
                onClick={() => dispatch(setShowForgotPassword(false))}
                disabled={isLoading}
              >
                Back to Sign In
              </button>
            </form>
          ) : activeTab === 'signin' ? (
            <form className="space-y-5" onSubmit={handleSignIn}>
              <div>
                <label className="block text-sm font-semibold mb-1 text-left text-gray-700">
                  Enter your email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="email@email.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                  value={email}
                  onChange={(e) => dispatch(setEmail(e.target.value.trim()))}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-left text-gray-700">
                  Enter password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                  value={password}
                  onChange={(e) => dispatch(setPassword(e.target.value))}
                  required
                  disabled={isLoading}
                />
                <div className="text-right mt-1.5">
                    <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
                    onClick={() => dispatch(setShowForgotPassword(true))}
                    disabled={isLoading}
                    >
                    Forgot password?
                    </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-teal-400 text-white py-2.5 rounded-full font-semibold text-base hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 disabled:opacity-50 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          ) : ( // activeTab === 'signup'
            <form className="space-y-4" onSubmit={handleSignUp}>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Enter your name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                  value={name}
                  onChange={(e) => dispatch(setName(e.target.value.trim()))}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Enter your email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="email@email.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                  value={email}
                  onChange={(e) => dispatch(setEmail(e.target.value.trim()))}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex space-x-3">
                <div className="w-1/2">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Enter password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                    value={password}
                    onChange={(e) => dispatch(setPassword(e.target.value))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Confirm password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                    value={confirmPassword}
                    onChange={(e) => dispatch(setConfirmPassword(e.target.value))}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  checked={termsAccepted}
                  onChange={(e) => dispatch(setTermsAccepted(e.target.checked))}
                  className="mt-0.5 h-4 w-4 text-teal-500 border-gray-300 rounded focus:ring-teal-400"
                  disabled={isLoading}
                />
                <label htmlFor="termsAccepted" className="text-xs text-gray-600">
                  I agree to the{' '}
                  <span className="text-teal-600 font-medium hover:underline cursor-pointer">
                    Privacy Policy, Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="text-teal-600 font-medium hover:underline cursor-pointer">
                    Subscription Policy
                  </span>
                </label>
              </div>
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="notificationsAccepted"
                  checked={notificationsAccepted}
                  onChange={(e) => dispatch(setNotificationsAccepted(e.target.checked))}
                  className="mt-0.5 h-4 w-4 text-teal-500 border-gray-300 rounded focus:ring-teal-400"
                  disabled={isLoading}
                />
                <label htmlFor="notificationsAccepted" className="text-xs text-gray-600">
                  I agree to receive important notifications and updates via email
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-teal-400 text-white py-2.5 rounded-full font-semibold text-base hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 disabled:opacity-50 flex items-center justify-center !mt-5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
      </div>
    </div>
  );
};

export default AuthModal;