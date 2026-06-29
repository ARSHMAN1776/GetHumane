import { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gethumane.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,           lastModified: new Date(), changeFrequency: 'daily',   priority: 1 },
    { url: `${BASE}/browse`,  lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE}/signup`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/login`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/safety`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  try {
    const supabase = await createServerClient()
    const { data: providers } = await supabase
      .from('users')
      .select('id, created_at')
      .eq('role', 'provider')
      .limit(5000)

    const providerRoutes: MetadataRoute.Sitemap = (providers ?? []).map((p) => ({
      url:              `${BASE}/provider/${p.id}`,
      lastModified:     new Date(p.created_at),
      changeFrequency:  'weekly',
      priority:         0.7,
    }))

    return [...staticRoutes, ...providerRoutes]
  } catch {
    return staticRoutes
  }
}
