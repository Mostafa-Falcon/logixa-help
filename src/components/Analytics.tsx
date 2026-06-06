'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('config', 'G-9QC9TQRLTW', {
      page_path: pathname + (searchParams?.toString() ? '?' + searchParams.toString() : ''),
    })
  }, [pathname, searchParams])

  return null
}
