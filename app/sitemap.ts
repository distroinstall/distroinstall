import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/how-it-works`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/compare`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // One public page per distribution.
  let distroRoutes: MetadataRoute.Sitemap = []
  try {
    const distros = await prisma.submission.groupBy({ by: ['distroName'] })
    distroRoutes = distros.map((d) => ({
      url: `${SITE_URL}/distro/${encodeURIComponent(d.distroName)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch {
    // If the DB is unreachable at build/request time, still serve static routes.
  }

  return [...staticRoutes, ...distroRoutes]
}
