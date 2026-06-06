"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { Trophy, Medal, Crown, ChevronLeft, Home } from "lucide-react"

import { db } from "@/lib/firebase"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const snap = await getDocs(query(collection(db, "profiles"), orderBy("reputation", "desc"), limit(50)))
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    load()
  }, [])

  const rankIcon = (i: number) => {
    if (i === 0) return <Crown className="h-5 w-5 text-amber-400" />
    if (i === 1) return <Medal className="h-5 w-5 text-slate-300" />
    if (i === 2) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="w-5 text-center text-sm muted">{i + 1}</span>
  }

  if (loading) return <div className="content-wrap"><Card padding="md" className="text-sm muted">جارٍ التحميل...</Card></div>

  return (
    <div className="content-wrap space-y-5">
      <div className="breadcrumb">
        <Link href="/" className="inline-flex items-center gap-1"><Home className="h-4 w-4" /> الرئيسية</Link>
        <ChevronLeft className="h-3 w-3" />
        <span>المتصدرين</span>
      </div>

      <PageHeader
        eyebrow="المتصدرين"
        title="أكثر الأعضاء نشاطاً"
        description="ترتيب الأعضاء حسب السمعة — تفاعل أكثر = سمعة أعلى"
        icon={<Trophy className="h-full w-full" />}
      />

      <section className="block-container">
        <div className="block-header"><span>أفضل 50 عضواً</span></div>
        {users.length === 0 ? (
          <div className="p-6 text-sm muted">لا يوجد أعضاء بعد</div>
        ) : (
          <div>
            {users.map((u: any, i: number) => (
              <div key={u.id} className="node" style={{ borderBottom: i < users.length - 1 ? "1px solid rgba(224, 197, 132, 0.1)" : "none" }}>
                <div className="node-body">
                  <div className="flex items-center gap-3">
                    <div className="flex w-8 justify-center">{rankIcon(i)}</div>
                    <div className="avatar h-10 w-10 text-sm">{u.username?.slice(0, 1)}</div>
                    <div className="node-main">
                      <Link href={`/u/${u.username}`} className="node-title no-underline hover:accent-text">
                        {u.displayName || u.username}
                      </Link>
                      <div className="node-stats-row">
                        <span className="text-xs muted">@{u.username}</span>
                        {u.role && u.role !== "user" && (
                          <Badge variant="accent">{u.role === "owner" ? "مالك" : u.role === "moderator" ? "مشرف" : u.role}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="muted">الموضوعات: <strong className="text-white">{u.threadCount ?? 0}</strong></span>
                    <span className="muted">الردود: <strong className="text-white">{u.replyCount ?? 0}</strong></span>
                    <span className="flex items-center gap-1 font-bold text-amber-400">{u.reputation ?? 0} <Trophy className="h-4 w-4" /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
