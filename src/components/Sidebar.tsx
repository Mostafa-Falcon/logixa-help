"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { Card } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"

export function Sidebar() {
  const [totalThreads, setTotalThreads] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [onlineCount, setOnlineCount] = useState(0)
  const [latestUser, setLatestUser] = useState("")

  useEffect(() => {
    async function load() {
      const [ts, us, ps] = await Promise.all([
        getDocs(collection(db, "threads")),
        getDocs(collection(db, "profiles")),
        getDocs(query(collection(db, "profiles"), orderBy("createdAt", "desc"), limit(1))),
      ])
      setTotalThreads(ts.size)
      setTotalUsers(us.size)
      if (!ps.empty) setLatestUser(ps.docs[0].data().username ?? "")

      const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
      const online = await getDocs(query(collection(db, "user_sessions"), where("lastSeenAt", ">=", fifteenMinAgo)))
      setOnlineCount(online.size)
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <aside className="space-y-4">
      <div className="stat-grid">
        <StatCard label="الموضوعات" value={totalThreads} />
        <StatCard label="الأعضاء" value={totalUsers} />
      </div>
      <Card variant="soft" padding="md">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
            <span className="muted">متصل الآن: <strong className="text-white">{onlineCount}</strong></span>
          </div>
          {latestUser && <div className="muted">آخر عضو: <strong className="text-white">{latestUser}</strong></div>}
        </div>
      </Card>
      <Card variant="soft" padding="md">
        <h4 className="mb-2 text-sm font-bold text-white">روابط سريعة</h4>
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/search" className="muted hover:text-white">🔍 بحث</Link>
          <Link href="/t/new" className="muted hover:text-white">✍️ سؤال جديد</Link>
          <Link href="/privacy" className="muted hover:text-white">🔒 الخصوصية</Link>
          <Link href="/terms" className="muted hover:text-white">📜 الشروط</Link>
        </div>
      </Card>
    </aside>
  )
}
