import { MetadataRoute } from 'next'
import clientPromise from '../../lib/mongodb'

interface Plant {
  _id: string
  slug?: string
  name: string
}

interface Problem {
  _id: string
  title: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.elch.live'

  // Static URLs with their priorities and change frequencies
  const staticUrls: MetadataRoute.Sitemap = [
    // Homepage
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },

    // About Us
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // Ask the Botanist
    {
      url: `${baseUrl}/ask-the-botanist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // Blog
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },

    // Company
    {
      url: `${baseUrl}/company`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // Company Reviews
    {
      url: `${baseUrl}/company/reviews`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },

    // Contact Us
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // Do Not Sell
    {
      url: `${baseUrl}/do-not-sell`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },

    // Education
    {
      url: `${baseUrl}/education`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // FAQ
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // Feed
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },

    // Plant Identification Main
    {
      url: `${baseUrl}/identify`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },

    // Money Back Guarantee
    {
      url: `${baseUrl}/money-back-guarantee`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },

    // Mushroom Identification
    {
      url: `${baseUrl}/mushroom-identification`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // My Plants
    {
      url: `${baseUrl}/my-plants`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // Plantin App
    {
      url: `${baseUrl}/plantinapp`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // Problems Main
    {
      url: `${baseUrl}/problems`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // Promo
    {
      url: `${baseUrl}/promo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },

    // Review
    {
      url: `${baseUrl}/review`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // Settings
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },

    // Subscription
    {
      url: `${baseUrl}/subscription`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // Authentication Routes
    {
      url: `${baseUrl}/auth/reset-password`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },

    // Authentication Modal
    {
      url: `${baseUrl}/authmodel`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  try {
    const client = await clientPromise
    const db = client.db('plantdb')

    // Fetch dynamic plant URLs directly from database
    const plantsCollection = db.collection('plants')
    const plantsFromDb = await plantsCollection.find({})
      .project({ _id: 1, slug: 1, name: 1 })
      .toArray()

    const dynamicPlantUrls: MetadataRoute.Sitemap = plantsFromDb
      .filter((plant: any) => plant.slug && typeof plant.slug === 'string' && plant.slug.trim().length > 0)
      .map((plant: any) => ({
        url: `${baseUrl}/plants/${plant.slug.trim()}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))

    // Fetch dynamic problem URLs directly from database
    const problemsCollection = db.collection('problems')
    const problemsFromDb = await problemsCollection.find({})
      .project({ _id: 1, title: 1 })
      .toArray()

    const dynamicProblemUrls: MetadataRoute.Sitemap = problemsFromDb
      .map((problem: any) => ({
        url: `${baseUrl}/problem/${problem._id.toString()}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))

    // Add plant identification category URLs (static but comprehensive)
    const plantCategoryUrls: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/identify/all-plants`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/identify/flowers`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/identify/succulents`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/identify/cactuses`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/identify/ferns`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/identify/shrubs`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/identify/trees`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/identify/grasses`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/identify/herbs`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/identify/houseplants`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/identify/veggies-fruit`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ]

    // Add problem category URLs
    const problemCategoryUrls: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/problems/all-problems`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/problems/disease-id`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/problems/pest-id`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/problems/weeds-id`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ]

    // Combine all URLs
    return [
      ...staticUrls,
      ...plantCategoryUrls,
      ...problemCategoryUrls,
      ...dynamicPlantUrls,
      ...dynamicProblemUrls,
    ]

  } catch (error) {
    console.error('Error generating dynamic sitemap:', error)

    // Return static URLs only if dynamic generation fails
    return [
      ...staticUrls,
      // Add fallback category URLs
      {
        url: `${baseUrl}/identify/all-plants`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/problems/all-problems`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ]
  }
}
