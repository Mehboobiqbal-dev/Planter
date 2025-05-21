
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function TestToken() {
  const { data: session, status } = useSession();
  const [protectedRouteResponse, setProtectedRouteResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      // Test the token with the protected route
      const testToken = async () => {
        try {
          const response = await fetch('/api/protected-route', {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          });
          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (response.ok) {
              setProtectedRouteResponse(JSON.stringify(data, null, 2));
            } else {
              setError(data.message || `HTTP ${response.status}: Failed to access protected route`);
            }
          } else {
            const text = await response.text();
            setError(`Non-JSON response: ${text || 'Empty response'} (HTTP ${response.status})`);
          }
        } catch (err) {
          setError('Error testing token: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
      };
      testToken();
    }
  }, [session]);

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return <div>Not signed in</div>;

  return (
    <div>
      <h1>Session Data</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <h2>Protected Route Response</h2>
      {protectedRouteResponse ? (
        <pre>{protectedRouteResponse}</pre>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <p>Testing token...</p>
      )}
    </div>
  );
}
