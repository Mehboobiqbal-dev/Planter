'use client';

import { SessionProvider } from 'next-auth/react';
import ReduxProvider from '../redux/providers';
import { usePathname } from 'next/navigation';
import { NavigationHeader } from './navigation/NavigationHeader';
import StickyFooter from './StickyFooter';
import Footer from './Footer';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const hideLayoutForAuth = pathname.startsWith('/authmodel');

  if (hideLayoutForAuth) {
    return (
      <ReduxProvider>
        <SessionProvider refetchOnWindowFocus={false}>
          {children}
        </SessionProvider>
      </ReduxProvider>
    );
  }

  return (
    <ReduxProvider>
      <SessionProvider refetchOnWindowFocus={false}>
        <NavigationHeader />
        <main className="flex-grow bg-white">{children}</main>
        <StickyFooter />
        <Footer />
      </SessionProvider>
    </ReduxProvider>
  );
}
