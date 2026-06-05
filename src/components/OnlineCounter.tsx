"use client"

import { useEffect, useState } from "react"

export function OnlineCounter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function fetchOnline() {
      try {
        const res = await fetch("/api/session")
        const data = await res.json()
        setCount(data.online_count ?? 0)
      } catch {}
    }
    fetchOnline()
    const interval = setInterval(fetchOnline, 30000)
    return () => clearInterval(interval)
  }, [])

  if (count === 0) return null

  return (
    <span className="flex items-center gap-1.5 text-xs muted">
      <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
      {count}
    </span>
  )
}
