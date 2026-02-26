import { Metadata } from 'next'

interface PlantStructuredData {
  name: string
  description: string
  image?: string
  scientificName?: string
  category?: string
  url: string
  careInstructions?: string
  difficulty?: string
  toxicity?: string
}

interface ProblemStructuredData {
  name: string
  description: string
  category: string
  symptoms?: string[]
  solutions?: string[]
  url: string
}

interface OrganizationStructuredData {
  name: string
  description: string
  url: string
  logo: string
  sameAs: string[]
}

export function PlantStructuredData({
  name,
  description,
  image,
  scientificName,
  category,
  url,
  careInstructions,
  difficulty,
  toxicity
}: PlantStructuredData) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Plant',
    name,
    description,
    ...(scientificName && { scientificName }),
    ...(category && { category }),
    ...(image && { image }),
    ...(url && { url }),
    ...(careInstructions && {
      careInstructions: {
        '@type': 'CreativeWork',
        text: careInstructions
      }
    }),
    ...(difficulty && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'Difficulty Level',
        value: difficulty
      }
    }),
    ...(toxicity && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'Toxicity',
        value: toxicity
      }
    }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    publisher: {
      '@type': 'Organization',
      name: 'PlantIn',
      url: 'https://www.Planter.live'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

export function ProblemStructuredData({
  name,
  description,
  category,
  symptoms,
  solutions,
  url
}: ProblemStructuredData) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name,
    description,
    code: {
      '@type': 'MedicalCode',
      codeValue: category,
      codingSystem: 'Plant Problem Category'
    },
    ...(symptoms && symptoms.length > 0 && {
      signOrSymptom: symptoms.map(symptom => ({
        '@type': 'MedicalSignOrSymptom',
        name: symptom
      }))
    }),
    ...(solutions && solutions.length > 0 && {
      possibleTreatment: solutions.map(solution => ({
        '@type': 'MedicalTherapy',
        name: solution
      }))
    }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    publisher: {
      '@type': 'Organization',
      name: 'PlantIn',
      url: 'https://www.Planter.live'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

export function OrganizationStructuredData({
  name,
  description,
  url,
  logo,
  sameAs
}: OrganizationStructuredData) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description,
    url,
    logo,
    sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${url}/contact-us`
    },
    offers: {
      '@type': 'Offer',
      category: 'Plant Identification Service',
      description: 'AI-powered plant identification and care advice'
    },
    knowsAbout: [
      'Plant Identification',
      'Plant Care',
      'Gardening',
      'Botany',
      'Plant Diseases',
      'Mushroom Identification',
      'Houseplants',
      'Succulents',
      'Flowers',
      'Vegetables',
      'Herbs'
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

// FAQ Structured Data
export function FAQStructuredData({
  questions
}: {
  questions: Array<{ question: string; answer: string }>
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

// Breadcrumb Structured Data
export function BreadcrumbStructuredData({
  items
}: {
  items: Array<{ name: string; url: string }>
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}
