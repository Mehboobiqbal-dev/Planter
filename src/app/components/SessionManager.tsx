// File: components/SessionManager.tsx (or a suitable location)
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { setAccessToken, setIsLoading as setAuthIsLoading } from '../redux/slices/authSlice'; // Adjust path
import { RootState } from '../redux/types'; // Adjust path

const SessionManager = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const currentReduxToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const syncToken = async () => {
      if (status === 'authenticated' && session) {
        // If NextAuth session is active, but no Redux token (e.g., after social login, or page refresh)
        // OR if the token in Redux might be stale / different from one derivable from session
        // For simplicity, we'll fetch if no Redux token.
        if (!currentReduxToken) {
          console.log('SessionManager: NextAuth authenticated, attempting to fetch app token.');
          dispatch(setAuthIsLoading(true));
          try {
            const response = await fetch('/api/auth/get-app-token');
            if (response.ok) {
              const data = await response.json();
              if (data.token) {
                dispatch(setAccessToken(data.token));
                console.log('SessionManager: App token fetched and set in Redux.');
              } else {
                console.warn('SessionManager: /api/auth/get-app-token responded OK but no token.');
              }
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.error('SessionManager: Failed to fetch app token.', response.status, errorData.error);
              // Optionally clear Redux token or handle error if fetch fails
              // dispatch(setAccessToken(null));
            }
          } catch (error) {
            console.error('SessionManager: Error calling /api/auth/get-app-token:', error);
          } finally {
            dispatch(setAuthIsLoading(false));
          }
        }
      } else if (status === 'unauthenticated') {
        // If NextAuth session is gone, and we have a Redux token, it might be stale.
        if (currentReduxToken) {
          console.log('SessionManager: NextAuth unauthenticated, clearing Redux token.');
          // dispatch(setAccessToken(null)); // This can cause issues if user is actively using app with a valid token
                                         // that NextAuth session doesn't know about (e.g. token from direct login).
                                         // Only clear if the Redux token is definitively tied to NextAuth session.
                                         // For now, let withAuth handle redirection based on missing token if necessary.
        }
      }
    };

    syncToken();
  }, [status, session, dispatch, currentReduxToken]);

  return null; // This component does not render anything
};

export default SessionManager;