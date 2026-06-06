"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck } from "lucide-react"
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"

export default function ModeratePage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) { router.push("/"); return }

    async function load() {
      const snap = await getDocs(query(collection(db, "reports"), orderBy("createdAt", "desc")))
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    load()
  }, [profile, authLoading, router])

  async function updateStatus(reportId: string, status: string) {
    await updateDoc(doc(db, "reports", reportId), { status, reviewedAt: new Date().toISOString() })
    setReports((prev) => prev.map((r: any) => r.id === reportId ? { ...r, status } : r))
  }

  if (authLoading || loading) return <div className="content-wrap"><div className="surface-card p-8 text-sm muted">جارٍ التحميل...</div></div>

  const openReports = reports.filter((r: any) => r.status === "open")
  const resolved = reports.filter((r: any) => r.status !== "open")

  return (
    <div className="content-wrap space-y-5">
      <PageHeader eyebrow="لوحة الإشراف" title="الإشراف على البلاغات" description="راجع البلاغات المقدمة من الأعضاء، واتخذ الإجراء المناسب." icon={<ShieldCheck className="h-6 w-6" />} />

      <section className="block-container">
        <div className="block-header">
          <span>بلاغات مفتوحة ({openReports.length})</span>
        </div>
        {openReports.length === 0 ? (
          <div className="p-6 text-sm muted">لا توجد بلاغات مفتوحة.</div>
        ) : (
          openReports.map((r: any) => (
            <div key={r.id} className="node" style={{ borderBottom: "1px solid rgba(224, 197, 132, 0.1)" }}>
              <div className="node-body">
                <div className="node-main">
                  <div className="node-title">{r.targetType === "thread" ? "📄 موضوع" : "💬 رد"} — {r.reason?.slice(0, 80)}</div>
                  <div className="node-stats-row">
                    <span>{new Date(r.createdAt).toLocaleDateString("ar-EG")}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => updateStatus(r.id, "resolved")}>حل</Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "dismissed")}>رفض</Button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {resolved.length > 0 && (
        <section className="block-container">
          <div className="block-header"><span>تمت المعالجة ({resolved.length})</span></div>
          {resolved.map((r: any) => (
            <div key={r.id} className="node" style={{ borderBottom: "1px solid rgba(224, 197, 132, 0.1)" }}>
              <div className="node-body">
                <div className="node-main">
                  <div className="node-title">{r.reason?.slice(0, 80)}</div>
                  <div className="node-stats-row">
                    <span className={r.status === "resolved" ? "text-green-400" : "text-amber-400"}>
                      {r.status === "resolved" ? "تم الحل" : "مرفوض"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
