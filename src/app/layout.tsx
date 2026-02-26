import { Poppins } from 'next/font/google';
import { Metadata } from 'next';
import { metadata as siteMetadata } from './metadata';

import './globals.css';
import { NavigationHeader } from './components/navigation/NavigationHeader';
import StickyFooter from './components/StickyFooter';
import Footer from './components/Footer';
import ClientLayout from './components/ClientLayout';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = siteMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen flex flex-col bg-white text-black" suppressHydrationWarning>
        <ClientLayout>
          <NavigationHeader />
          <main className="flex-grow bg-white">{children}</main>
          <StickyFooter />
          <Footer />
        </ClientLayout>
      </body>
    </html>
  );
}