"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FolderPlus, Plus } from "lucide-react"
import { collection, getDocs, query, orderBy, setDoc, doc, deleteDoc } from "firebase/firestore"
import { toast } from "sonner"

import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

function toSlug(value: string) {
  return value.trim().replace(/[^\w\s\u0600-\u06FF-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 90)
}

export default function AdminPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("💬")
  const [field, setField] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!profile || (profile.role !== "owner" && profile.role !== "admin" && profile.role !== "moderator")) { toast.error("مفيش صلاحية"); router.push("/"); return }
    getDocs(query(collection(db, "categories"), orderBy("order"))).then((snap) =>
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    )
  }, [profile, loading, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const catSlug = slug || toSlug(name)
      await setDoc(doc(db, "categories", catSlug), {
        name, slug: catSlug, description, icon, field: field || "عام", order: categories.length + 1, threadCount: 0, createdAt: new Date().toISOString(),
      })
      toast.success("تم إنشاء القسم")
      setName(""); setSlug(""); setDescription(""); setIcon("💬"); setField("")
      const snap = await getDocs(query(collection(db, "categories"), orderBy("order")))
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch { toast.error("فشل إنشاء القسم") }
    finally { setSaving(false) }
  }

  async function deleteCategory(id: string) {
    try {
      await deleteDoc(doc(db, "categories", id))
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast.success("تم حذف القسم")
    } catch { toast.error("فشل حذف القسم") }
  }

  if (loading) return <div className="content-wrap"><div className="surface-card p-8 text-sm muted">جارٍ التحميل...</div></div>

  return (
    <div className="content-wrap space-y-5">
      <div className="mb-4 space-y-2">
        <h1 className="page-title text-2xl">لوحة الإدارة</h1>
        <p className="page-desc">إدارة الأقسام — أضف أو احذف الأقسام الأساسية للمنتدى</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card padding="md">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-white"><FolderPlus className="h-5 w-5" /> إضافة قسم جديد</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>اسم القسم</Label><Input value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(toSlug(e.target.value)) }} required placeholder="مثال: الشبكات" /></div>
              <div><Label>الأيقونة</Label><Input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={4} placeholder="🌐" /></div>
            </div>
            <div><Label>الرابط المختصر</Label><Input value={slug} onChange={(e) => setSlug(toSlug(e.target.value))} required dir="ltr" className="text-left" placeholder="networks" /></div>
            <div>
              <Label>المجال</Label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="form-input"
              >
                <option value="">عام</option>
                <option value="تقنية">تقنية</option>
                <option value="تعليم">تعليم</option>
                <option value="صحة">صحة</option>
                <option value="أعمال">أعمال</option>
                <option value="ترفيه">ترفيه</option>
                <option value="أمن">أمن</option>
                <option value="فنون">فنون</option>
              </select>
            </div>
            <div><Label>وصف القسم</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="وصف يساعد الزائر وجوجل يفهموا القسم" /></div>
            <Button type="submit" variant="primary" disabled={saving}><Plus className="h-4 w-4" /> {saving ? "إضافة..." : "إضافة قسم"}</Button>
          </form>
        </Card>

        <Card padding="md">
          <h2 className="mb-4 text-lg font-extrabold text-white">الأقسام الحالية ({categories.length})</h2>
          {categories.length === 0 ? (
            <div className="text-sm muted">لا توجد أقسام بعد</div>
          ) : (
            <div className="space-y-2">
              {categories.map((c: any) => (
                <div key={c.id} className="surface-soft flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{c.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-white">{c.name}</div>
                      <div className="text-xs muted">{c.slug} · {c.threadCount ?? 0} موضوعات{c.field ? ` · ${c.field}` : ""}</div>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => deleteCategory(c.id)}>حذف</Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
