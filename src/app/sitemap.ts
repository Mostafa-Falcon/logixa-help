import type { MetadataRoute } from 'next'

const baseUrl = 'https://logixa-help.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '/',
    '/login',
    '/register',
    '/search',
    '/privacy',
    '/terms',
    '/notifications',
    '/settings',
    '/moderate',
    '/admin',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '/' ? 1 : 0.8,
  }))

  return staticRoutes
}
