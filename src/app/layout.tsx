// src/app/layout.tsx
'use client';

import './globals.css';
import { NavigationHeader } from './components/NavigationHeader'; // Assuming correct path
import StickyFooter from './components/StickyFooter'; // Assuming correct path
import Footer from './components/Footer'; // Assuming correct path
import { SessionProvider } from 'next-auth/react';
import { Poppins } from 'next/font/google';
import ReduxProvider from './redux/providers'; // Assuming correct path
import { usePathname } from 'next/navigation';
import React from 'react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader = pathname.startsWith('/authmodel');

  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen flex flex-col bg-white text-black" suppressHydrationWarning>
        <ReduxProvider>
          {/* KEY CHANGE HERE */}
          <SessionProvider
            // Defaults to true. Set to false to prevent session refetch on window focus.
            refetchOnWindowFocus={false}
            // Optional: You might also want to control the interval if you don't want frequent background checks
            // refetchInterval={0} // Disables interval-based refetching entirely
            // refetchWhenOffline={false} // Optional: prevent refetch when browser goes offline
          >
            {!hideHeader && <NavigationHeader />}
            <main className="flex-grow bg-white">{children}</main>
            {!hideHeader && <StickyFooter />}
            <Footer />
          </SessionProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}