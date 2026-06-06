import type { MetadataRoute } from 'next'

const baseUrl = 'https://logixa-help.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap[number][] = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/leaderboard`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap[number][] = []
  const threadRoutes: MetadataRoute.Sitemap[number][] = []

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const [catRes, threadRes] = await Promise.all([
      fetch(`${baseUrl}/api/categories`, { signal: controller.signal }),
      fetch(`${baseUrl}/api/threads`, { signal: controller.signal }),
    ])
    clearTimeout(timeout)

    if (catRes.ok) {
      const cats = await catRes.json()
      if (Array.isArray(cats)) {
        for (const cat of cats) {
          if (!cat?.id) continue
          const d = safeDate(cat.createdAt)
          categoryRoutes.push({
            url: `${baseUrl}/c/${cat.id}`,
            lastModified: d,
            changeFrequency: 'weekly',
            priority: 0.7,
          })
        }
      }
    }

    if (threadRes.ok) {
      const data = await threadRes.json()
      const list: unknown[] = data?.threads ?? (Array.isArray(data) ? data : [])
      for (const thread of list) {
        if (!thread || typeof thread !== 'object') continue
        const t = thread as Record<string, unknown>
        if (!t.slug || typeof t.slug !== 'string') continue
        const d = safeDate(t.updatedAt ?? t.createdAt)
        threadRoutes.push({
          url: `${baseUrl}/t/${t.slug}`,
          lastModified: d,
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
  } catch {
    // fallback to static routes
  }

  return [...staticRoutes, ...categoryRoutes, ...threadRoutes]
}

function safeDate(value: unknown): Date {
  if (!value) return new Date()
  if (typeof value === 'string') {
    const d = new Date(value)
    if (!isNaN(d.getTime())) return d
  }
  if (typeof value === 'number') {
    const d = new Date(value)
    if (!isNaN(d.getTime())) return d
  }
  if (value instanceof Date && !isNaN(value.getTime())) return value
  return new Date()
}
