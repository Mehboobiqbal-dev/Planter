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
  // You can rename this variable for clarity if you prefer, e.g., isAuthPage
  const hideLayoutForAuth = pathname.startsWith('/authmodel');

  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen flex flex-col bg-white text-black" suppressHydrationWarning>
        <ReduxProvider>
          <SessionProvider
            refetchOnWindowFocus={false}
          >
            {!hideLayoutForAuth && <NavigationHeader />}
            <main className="flex-grow bg-white">{children}</main>
            {!hideLayoutForAuth && <StickyFooter />}
            {/* KEY CHANGE HERE: Conditionally render Footer as well */}
            {!hideLayoutForAuth && <Footer />}
          </SessionProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}