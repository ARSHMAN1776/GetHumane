import { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gethumane.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/browse', '/provider/', '/safety', '/signup', '/login'],
        disallow: ['/dashboard', '/book/', '/api/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
