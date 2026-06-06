import type { MetadataRoute } from 'next'

const baseUrl = 'https://logixa-help.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '/', '/login', '/register', '/search', '/privacy', '/terms',
    '/leaderboard', '/notifications', '/settings', '/moderate', '/admin',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '/' ? 1 : 0.8,
  } as MetadataRoute.Sitemap[number]))

  const categoryRoutes: MetadataRoute.Sitemap[number][] = []
  const threadRoutes: MetadataRoute.Sitemap[number][] = []

  try {
    const [catRes, threadRes] = await Promise.all([
      fetch(`${baseUrl}/api/categories`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/api/threads`, { next: { revalidate: 3600 } }),
    ])

    if (catRes.ok) {
      const cats = await catRes.json()
      for (const cat of cats) {
        categoryRoutes.push({
          url: `${baseUrl}/c/${cat.id}`,
          lastModified: new Date(cat.createdAt ?? Date.now()),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    }

    if (threadRes.ok) {
      const threads = await threadRes.json()
      for (const thread of threads) {
        threadRoutes.push({
          url: `${baseUrl}/t/${thread.slug}`,
          lastModified: new Date(thread.updatedAt ?? thread.createdAt ?? Date.now()),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
  } catch {
    // fallback to static routes only
  }

  return [...staticRoutes, ...categoryRoutes, ...threadRoutes]
}
