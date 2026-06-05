"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<any>(null)
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const pSnap = await getDocs(query(collection(db, "profiles"), where("username", "==", username)))
      if (pSnap.empty) { setLoading(false); return }
      const p = { id: pSnap.docs[0].id, ...pSnap.docs[0].data() }
      setProfile(p)

      const tSnap = await getDocs(query(collection(db, "threads"), where("author_id", "==", p.id), where("status", "==", "published")))
      setThreads(tSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    load()
  }, [username])

  if (loading) return <div className="content-wrap"><div className="surface-card p-8 text-sm muted">جارٍ التحميل...</div></div>
  if (!profile) return <div className="content-wrap"><div className="surface-card p-8 text-sm muted">المستخدم غير موجود</div></div>

  return (
    <div className="content-wrap space-y-5">
      <PageHeader
        eyebrow="الملف الشخصي"
        title={profile.display_name || profile.username}
        description={profile.bio || "لم يكتب نبذة عن نفسه بعد"}
      />

      <Card padding="md">
        <div className="flex items-center gap-4">
          <div className="avatar h-14 w-14 text-lg">{profile.username.slice(0, 1)}</div>
          <div>
            <h2 className="text-xl font-extrabold text-white">{profile.display_name || profile.username}</h2>
            <p className="text-sm muted">@{profile.username}</p>
            <div className="flex gap-3 mt-2 text-xs muted">
              <span>الموضوعات: {profile.threads_count ?? 0}</span>
              <span>الردود: {profile.replies_count ?? 0}</span>
              <span>السمعة: {profile.reputation ?? 0}</span>
            </div>
          </div>
          {profile.role && profile.role !== "member" && <Badge variant="accent">{profile.role}</Badge>}
        </div>
      </Card>

      <section>
        <h3 className="mb-3 text-lg font-extrabold text-white">آخر الموضوعات</h3>
        {threads.length === 0 ? (
          <Card padding="md" className="text-sm muted">لا توجد موضوعات بعد</Card>
        ) : (
          <div className="space-y-2">
            {threads.map((t: any) => (
              <Card key={t.id} variant="section" padding="md">
                <a href={`/t/${t.slug}`} className="block text-white font-bold hover:accent-text">{t.title}</a>
                <p className="text-xs muted mt-1">{t.replies_count ?? 0} ردود · {t.views ?? 0} مشاهدة</p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
