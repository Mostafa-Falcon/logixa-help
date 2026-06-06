import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'

import AppProviders from '@/components/AppProviders'
import PwaRegister from '@/components/PwaRegister'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700', '800'],
})

const baseUrl = 'https://logixa-help.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Logixa Help - منتدى عربي تقني للأسئلة والحلول',
    template: '%s - Logixa Help',
  },
  description:
    'منتدى عربي تقني يساعدك في مشاكل الكمبيوتر، الموبايل، البرمجة، وأدوات الذكاء الاصطناعي. صفحات سريعة، محتوى واضح، وتجربة قراءة موثوقة.',
  keywords: ['منتدى عربي', 'تقني', 'أسئلة', 'حلول', 'كمبيوتر', 'برمجة', 'ذكاء اصطناعي', 'مشاكل ويندوز', 'شروحات'],
  openGraph: {
    title: 'Logixa Help - منتدى عربي تقني للأسئلة والحلول',
    description:
      'منصة عربية للأسئلة والإجابات التقنية تجمع حلولًا عملية لمشاكل الكمبيوتر، الموبايل، البرمجة، والذكاء الاصطناعي.',
    type: 'website',
    locale: 'ar_AR',
    siteName: 'Logixa Help',
    url: baseUrl,
  },
  twitter: {
    card: 'summary',
    title: 'Logixa Help - منتدى عربي تقني',
    description: 'منصة عربية للأسئلة والإجابات التقنية',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: baseUrl,
  },
  category: 'technology',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#11130f" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="monetag" content="2c3d32eb5adf91efa4499e66f4def7bd" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Logixa Help",
            "alternateName": "منتدى Logixa Help",
            "url": baseUrl,
            "description": "منتدى عربي تقني للأسئلة والحلول في الكمبيوتر، الموبايل، البرمجة، والذكاء الاصطناعي.",
            "inLanguage": "ar",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/search?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Logixa Help Forum",
            "url": baseUrl,
            "applicationCategory": "Forum",
            "operatingSystem": "All",
            "description": "منصة عربية للأسئلة والإجابات التقنية",
            "inLanguage": "ar",
          }),
        }}
      />
      <body className={`${cairo.variable} app-body`}>
        <AppProviders>
          <PwaRegister />
          <div className="site-shell">
            <Header />
            <main className="page-shell page-fade-in flex-1 py-6 md:py-8">
              {children}
            </main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  )
}
