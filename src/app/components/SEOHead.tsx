import { Metadata } from 'next'
import Head from 'next/head'
import { OrganizationStructuredData } from './StructuredData'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  noindex?: boolean
}

export default function SEOHead({
  title,
  description = 'Identify plants instantly with our advanced AI plant identifier. Get expert plant care advice, diagnose plant problems, and learn how to grow healthy plants.',
  keywords = [
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
    'plant diagnosis'
  ],
  image = 'https://www.Planter.live/android-chrome-512x512.png',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'PlantIn Team',
  section,
  tags,
  noindex = false
}: SEOHeadProps) {
  const siteTitle = 'PlantIn - Plant Identification & Care'
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const canonicalUrl = url ? `https://www.Planter.live${url}` : 'https://www.Planter.live'

  // Generate structured data for organization
  const organizationData = {
    name: 'PlantIn',
    description: 'Advanced AI-powered plant identification and care platform with expert botanical advice',
    url: 'https://www.Planter.live',
    logo: 'https://www.Planter.live/android-chrome-512x512.png',
    sameAs: [
      'https://www.facebook.com/plantinapp',
      'https://www.instagram.com/plantinapp',
      'https://twitter.com/plantinapp'
    ]
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots Meta */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        </>
      )}

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:image:alt" content={title || 'PlantIn - Plant Identification & Care'} />
      <meta property="og:site_name" content="PlantIn" />
      <meta property="og:locale" content="en_US" />

      {/* Article specific Open Graph tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags && tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title || 'PlantIn - Plant Identification & Care'} />
      <meta name="twitter:site" content="@plantinapp" />
      <meta name="twitter:creator" content="@plantinapp" />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#22c55e" />
      <meta name="msapplication-TileColor" content="#22c55e" />
      <meta name="application-name" content="PlantIn" />

      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="PlantIn" />

      {/* Favicons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

      {/* DNS prefetch for external resources */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />

      {/* Structured Data */}
      <OrganizationStructuredData {...organizationData} />
    </Head>
  )
}

// Utility function to generate SEO metadata for dynamic pages
export function generatePlantSEO(plant: {
  name: string
  slug?: string
  latin?: string
  description?: string
  category?: string
  image?: string
  difficulty?: string
  toxicity?: string
}): Metadata {
  const title = `${plant.name} Care Guide & Identification`
  const description = `Learn everything about ${plant.name}${plant.latin ? ` (${plant.latin})` : ''}. Care instructions, identification tips, growing guide, and common problems.`
  const url = `/plants/${plant.slug || plant.name.toLowerCase().replace(/\s+/g, '-')}`
  const image = plant.image || 'https://www.Planter.live/android-chrome-512x512.png'

  return {
    title,
    description,
    keywords: [
      plant.name.toLowerCase(),
      ...(plant.latin ? [plant.latin.toLowerCase()] : []),
      ...(plant.category ? [plant.category.toLowerCase()] : []),
      'plant care',
      'plant identification',
      'gardening',
      'houseplants'
    ],
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image, alt: `${plant.name} plant` }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export function generateProblemSEO(problem: {
  title: string
  _id: string
  category?: string
  description?: string
}): Metadata {
  const title = `How to Fix ${problem.title} - Plant Problem Solutions`
  const description = `Complete guide to identify and fix ${problem.title}. Symptoms, causes, and effective treatment solutions for plant problems.`
  const url = `/problem/${problem._id}`

  return {
    title,
    description,
    keywords: [
      problem.title.toLowerCase(),
      'plant problems',
      'plant diseases',
      'plant care',
      'gardening tips',
      ...(problem.category ? [problem.category.toLowerCase()] : [])
    ],
    openGraph: {
      title,
      description,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
