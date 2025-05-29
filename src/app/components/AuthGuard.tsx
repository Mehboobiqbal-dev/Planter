// File: hoc/withAuth.tsx (or components/AuthGuard.tsx)
'use client';

import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation'; // usePathname for current path
import { useEffect, useState } from 'react';
import { RootState } from '../redux/store'; // Adjust path
import ClipLoader from 'react-spinners/ClipLoader'; // Or your preferred loader

export default function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();
    const pathname = usePathname();
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    // isLoading from Redux reflects ongoing auth operations (like SessionManager fetching token)
    const authLoading = useSelector((state: RootState) => state.auth.isLoading); 
    
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      // Don't run check if auth operations are in progress (e.g., token fetch by SessionManager)
      if (authLoading) {
        setIsChecking(true); // Remain in checking state while auth is loading
        return;
      }

      // Auth operations are done, now check token
      if (!accessToken) {
        console.log('withAuth: No access token, redirecting to auth modal.');
        // Store current path to redirect back after login
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectAfterLogin', pathname + window.location.search);
        }
        router.replace('/authmodal?reason=unauthenticated'); // Redirect to your auth modal
      } else {
        setIsChecking(false); // Token exists, allow rendering
      }
    }, [accessToken, authLoading, router, pathname]);

    if (isChecking || authLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-screen">
          <ClipLoader size={50} color="#14B8A6" />
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  // Set a display name for easier debugging in React DevTools
  ComponentWithAuth.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ComponentWithAuth;
}