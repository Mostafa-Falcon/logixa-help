'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export function OnlineCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    async function fetchOnline() {
      try {
        const res = await fetch('/api/session', { method: 'POST' })
        if (!res.ok) return
        const data = await res.json()
        setCount(data.online ?? null)
      } catch {
        // ignore
      }
    }

    fetchOnline()
    const interval = setInterval(fetchOnline, 60000)
    return () => clearInterval(interval)
  }, [])

  if (count === null) return null

  return (
    <div className="flex items-center gap-2 text-xs muted">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400/60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
      </span>
      <span>{count} متصل الآن</span>
    </div>
  )
}
