"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, BellOff, ChevronLeft, Home, MessageSquare, ShieldCheck, ThumbsUp, Trophy } from "lucide-react"
import { collection, getDocs, query, where, orderBy, limit, doc, writeBatch } from "firebase/firestore"
import { CheckCheck } from "lucide-react"
import { toast } from "sonner"

import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"

const iconMap: Record<string, React.ReactNode> = {
  reply: <MessageSquare className="h-5 w-5" />,
  vote: <ThumbsUp className="h-5 w-5" />,
  best_answer: <Trophy className="h-5 w-5" />,
  report_update: <ShieldCheck className="h-5 w-5" />,
  mod_action: <ShieldCheck className="h-5 w-5" />,
}

export default function NotificationsPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!profile) { router.push("/login?next=/notifications"); return }
    const pid = profile.id

    async function load() {
      const snap = await getDocs(
        query(collection(db, "notifications"), where("recipientUid", "==", pid), orderBy("createdAt", "desc"), limit(50)),
      )
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    load()
  }, [profile, authLoading, router])

  async function markAllRead() {
    try {
      const batch = writeBatch(db)
      notifications.forEach((n: any) => {
        if (!n.isRead) batch.update(doc(db, "notifications", n.id), { isRead: true })
      })
      await batch.commit()
      setNotifications((prev: any[]) => prev.map((n: any) => ({ ...n, isRead: true })))
      toast.success("تم تحديد الكل كمقروء")
    } catch {
      toast.error("حدث خطأ")
    }
  }

  const unreadCount = notifications.filter((n: any) => !n.isRead).length
  if (authLoading || loading) return <div className="content-wrap"><div className="surface-card p-8 text-sm muted">جارٍ التحميل...</div></div>

  return (
    <div className="content-wrap space-y-5">
      <div className="breadcrumb">
        <Link href="/" className="inline-flex items-center gap-1"><Home className="h-4 w-4" /> الرئيسية</Link>
        <ChevronLeft className="h-3 w-3" />
        <span>الإشعارات</span>
      </div>

      <PageHeader
        eyebrow="الإشعارات"
        title={`عندك ${unreadCount} إشعار غير مقروء`}
        description="كل اللي حصل على موضوعاتك وردودك"
        icon={<Bell className="h-full w-full" />}
        actions={unreadCount > 0 ? <Button type="button" variant="outline" onClick={markAllRead}><CheckCheck className="h-4 w-4" /> تحديد الكل كمقروء</Button> : null}
      />

      <section className="block-container">
        <div className="block-header">
          <span>آخر الإشعارات</span>
          <span className="muted text-sm">{notifications.length} إشعار</span>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <BellOff className="text-3xl text-text-dim" />
            <p className="text-sm muted">مافيش إشعارات جديدة.</p>
          </div>
        ) : (
          <div>
            {notifications.map((n: any, i: number) => (
              <div key={n.id} className="node block"
                style={{ borderBottom: i < notifications.length - 1 ? "1px solid rgba(224, 197, 132, 0.1)" : "none", opacity: n.isRead ? 0.6 : 1 }}>
                {n.link ? (
                  <Link href={n.link} className="node-body no-underline">
                    <div className="node-icon" style={{ color: n.isRead ? "rgba(224, 197, 132, 0.4)" : "rgba(224, 182, 92, 0.9)" }}>
                      {iconMap[n.type] ?? <Bell className="h-5 w-5" />}
                    </div>
                    <div className="node-main">
                      <div className="node-title" style={{ fontWeight: n.isRead ? 400 : 700 }}>{n.title}</div>
                      {n.body && <div className="node-desc">{n.body}</div>}
                      <div className="node-stats-row">
                        <span className="text-xs muted">
                          {new Date(n.createdAt).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="node-body">
                    <div className="node-icon" style={{ color: n.isRead ? "rgba(224, 197, 132, 0.4)" : "rgba(224, 182, 92, 0.9)" }}>
                      {iconMap[n.type] ?? <Bell className="h-5 w-5" />}
                    </div>
                    <div className="node-main">
                      <div className="node-title" style={{ fontWeight: n.isRead ? 400 : 700 }}>{n.title}</div>
                      {n.body && <div className="node-desc">{n.body}</div>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
