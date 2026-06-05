import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/moderate/', '/api/', '/settings/', '/notifications/'],
    },
    sitemap: 'https://logixa-help.vercel.app/sitemap.xml',
  }
}
