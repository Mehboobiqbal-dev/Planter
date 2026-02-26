import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Plant Identification & Plant Care - Identify, Diagnose & Grow Healthy Plants',
    template: '%s | PlantIn - Plant Identification & Care'
  },
  description: 'Identify plants instantly with our advanced AI plant identifier. Get expert plant care advice, diagnose plant problems, and learn how to grow healthy plants. Over 17,000 plant species database.',
  keywords: [
    'plant identification',
    'plant care',
    'plant diseases',
    'plant problems',
    'gardening tips',
    'houseplants',
    'succulents',
    'flowers',
    'vegetables',
    'herbs',
    'plant diagnosis',
    'botanical expert',
    'mycology',
    'mushroom identification'
  ],
  authors: [{ name: 'PlantIn Team' }],
  creator: 'PlantIn',
  publisher: 'PlantIn',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.elch.live'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.elch.live',
    title: 'Plant Identification & Plant Care - Identify, Diagnose & Grow Healthy Plants',
    description: 'Identify plants instantly with our advanced AI plant identifier. Get expert plant care advice, diagnose plant problems, and learn how to grow healthy plants.',
    siteName: 'PlantIn',
    images: [
      {
        url: 'https://www.elch.live/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'PlantIn - Plant Identification & Care App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plant Identification & Plant Care - Identify, Diagnose & Grow Healthy Plants',
    description: 'Identify plants instantly with our advanced AI plant identifier. Get expert plant care advice, diagnose plant problems, and learn how to grow healthy plants.',
    images: ['https://www.elch.live/android-chrome-512x512.png'],
    creator: '@plantinapp',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code', // Replace with actual code
    yandex: 'your-yandex-verification-code', // Replace with actual code
    other: {
      'msvalidate.01': 'your-bing-site-verification-code', // Bing uses msvalidate.01 meta tag
    },
  },
  category: 'gardening',
}