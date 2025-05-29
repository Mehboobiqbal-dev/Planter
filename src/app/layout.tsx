'use client';

import './globals.css';
import { NavigationHeader } from './components/NavigationHeader';
import StickyFooter from './components/StickyFooter';
import Footer from './components/Footer';
import { SessionProvider } from 'next-auth/react';
import { Poppins } from 'next/font/google';
import ReduxProvider from './redux/providers';
import { usePathname } from 'next/navigation'; // ✅ You missed this import
import React from 'react'; // ✅ React import is good practice

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // ✅ This goes here, NOT in the parameter list
  const hideHeader = pathname.startsWith('/authmodel'); // ✅ After pathname is defined

  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen flex flex-col bg-white text-black" suppressHydrationWarning>
        <ReduxProvider>
          <SessionProvider>
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