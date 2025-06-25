'use client';

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { IoClose } from 'react-icons/io5';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  setError,
  setForgotMessage,
  setIsLoading,
  resetAuthState,
} from '../redux/slices/authSlice';
import { RootState } from '../redux/types';

import AuthFormContainer from '../components/AuthFormContainer';
import AuthPromoPanel from '../components/AuthPromoPanel';

const AuthModalPage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [formError, setFormError] = useState<string>('');
  
  // Select the entire auth state slice once
  const authState = useSelector((state: RootState) => state.auth);
  const {
    email, password, confirmPassword, name, forgotEmail,
    error, termsAccepted, activeTab, showForgotPassword,
  } = authState;

  const isValidEmail = useCallback((emailString: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailString);
  }, []);

  useEffect(() => {
    setFormError(''); 
    dispatch(setError('')); 
  }, [activeTab, showForgotPassword, dispatch]);

  const handleSignIn = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFormError('');
    if (!isValidEmail(email)) return setFormError('Please enter a valid email address.');
    if (!password) return setFormError('Please enter your password.');

    dispatch(setError(''));
    dispatch(setIsLoading(true));
    try {
      const result = await signIn('credentials', { redirect: false, email, password });
      if (result?.error) {
        const errorMessage = result.error.includes('CredentialsSignin') || result.error.includes('Invalid email or password')
          ? 'Incorrect email or password. Please try again.'
          : result.error.includes('NetworkError')
          ? 'Network error: Unable to connect to the authentication server.'
          : 'Sign-in failed. Please try again later.';
        dispatch(setError(errorMessage));
      } else if (result?.ok) {
        dispatch(resetAuthState());
        router.push('/');
      } else {
        dispatch(setError('Sign-in attempt failed. Please try again.'));
      }
    } catch (err) {
      dispatch(setError('An unexpected error occurred during sign-in.'));
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, email, password, router, isValidEmail]);

  const handleSignUp = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) return setFormError('Please enter your name.');
    if (!isValidEmail(email)) return setFormError('Please enter a valid email address.');
    if (password.length < 6) return setFormError('Password must be at least 6 characters long.');
    if (password !== confirmPassword) return setFormError('Passwords do not match.');
    if (!termsAccepted) return setFormError('You must agree to the policies to sign up.');

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
        dispatch(setError(data.error || `Sign-up failed (Status: ${response.status}).`));
        return;
      }
      
      const signInResult = await signIn('credentials', { redirect: false, email, password });
      if (signInResult?.error) {
        dispatch(setError('Sign-up was successful, but auto sign-in failed. Please sign in manually.'));
      } else if (signInResult?.ok) {
        dispatch(resetAuthState());
        router.push('/');
      }
    } catch (err) {
      dispatch(setError('An unexpected error occurred during sign-up.'));
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, email, password, confirmPassword, name, termsAccepted, router, isValidEmail]);

  const handleForgotPassword = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFormError('');
    if (!isValidEmail(forgotEmail)) return setFormError('Please enter a valid email address.');

    dispatch(setError(''));
    dispatch(setForgotMessage(''));
    dispatch(setIsLoading(true));
    try {
      const response = await fetch('/api/forgetpassword', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        dispatch(setError(data.error || `Failed to send reset link (Status: ${response.status}).`));
      } else {
        dispatch(setForgotMessage(data.message || 'If an account exists, a reset link has been sent.'));
      }
    } catch (err) {
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
        const errorMessage = result.error.includes('OAuthAccountNotLinked')
          ? 'This social account may be linked to another user.'
          : `Failed to sign in with ${provider}. Please try again.`;
        dispatch(setError(errorMessage));
      } else if (result?.ok) {
        dispatch(resetAuthState());
      }
    } catch (err) {
      dispatch(setError(`An unexpected error occurred during ${provider} sign-in.`));
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch]);

  const currentError = useMemo(() => formError || error, [formError, error]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans bg-gradient-to-br from-[#E6FBF5] to-[#C0F0E4] md:bg-gray-100 relative overflow-x-hidden">
      <button
        className="absolute top-5 right-5 sm:top-6 sm:right-6 bg-white rounded-full p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 shadow-md focus:outline-none z-20"
        aria-label="Close"
        onClick={() => router.push('/')}
      >
        <IoClose size={24} />
      </button>

      <AuthFormContainer
        authState={authState}
        currentError={currentError}
        onSocialSignIn={handleSocialSignIn}
        handleSignIn={handleSignIn}
        handleSignUp={handleSignUp}
        handleForgotPassword={handleForgotPassword}
      />
      
      <AuthPromoPanel 
        activeTab={activeTab} 
        showForgotPassword={showForgotPassword} 
      />
    </div>
  );
};

export default AuthModalPage;