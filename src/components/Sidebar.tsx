"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore"
import { FileText, MessageSquare, Plus, Search, Shield, Users } from "lucide-react"

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
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="muted">المتصلين الآن</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
              <strong className="text-white text-base">{onlineCount}</strong>
            </span>
          </div>
          <hr className="premium-divider" />
          <div className="flex items-center justify-between text-sm">
            <span className="muted">آخر عضو</span>
            <span className="text-white font-bold text-sm">{latestUser || "—"}</span>
          </div>
        </div>
      </Card>

      <Card variant="soft" padding="md" className="card-glow">
        <h4 className="mb-2 text-sm font-bold text-white flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          روابط سريعة
        </h4>
        <div className="flex flex-col gap-0.5">
          <Link href="/search" className="sidebar-link"><Search className="h-3.5 w-3.5" /> بحث في المنتدى</Link>
          <Link href="/t/new" className="sidebar-link"><Plus className="h-3.5 w-3.5" /> سؤال جديد</Link>
          <Link href="/leaderboard" className="sidebar-link"><Users className="h-3.5 w-3.5" /> المتصدرين</Link>
          <hr className="premium-divider" />
          <Link href="/privacy" className="sidebar-link"><Shield className="h-3.5 w-3.5" /> الخصوصية</Link>
          <Link href="/terms" className="sidebar-link"><FileText className="h-3.5 w-3.5" /> الشروط</Link>
        </div>
      </Card>
    </aside>
  )
}
