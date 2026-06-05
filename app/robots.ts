import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/utils'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep private/transactional areas out of the index.
      disallow: ['/api/', '/dashboard', '/login', '/u/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
