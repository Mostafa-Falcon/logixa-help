"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HiChevronLeft, HiHome, HiLightningBolt, HiPencilAlt } from "react-icons/hi"
import { LogIn } from "lucide-react"
import { collection, addDoc, getDocs, query, where, doc, increment, updateDoc } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import RichEditor from "@/components/RichEditor"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

function toSlug(value: string) {
  return value.trim()
    .replace(/[^\w\s\u0600-\u06FF-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 90)
}

export default function NewThreadComposer({ categories }: { categories: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [categoryId, setCategoryId] = useState(searchParams.get("cat") || "")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z\u0600-\u06FF0-9-]/g, "").slice(0, 20)
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t])
      setTagInput("")
    }
  }

  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { setError("لازم تسجل دخولك الأول"); return }

    setSending(true)
    setError("")

    try {
      const baseSlug = toSlug(title) || "thread"
      const existing = await getDocs(query(collection(db, "threads"), where("slug", ">=", baseSlug), where("slug", "<", baseSlug + "\uf8ff")))
      const slug = existing.empty ? baseSlug : `${baseSlug}-${Date.now()}`

      const ref = await addDoc(collection(db, "threads"), {
        title,
        slug,
        content: body,
        categoryId,
        authorUid: user.uid,
        authorUsername: user.displayName || user.email?.split("@")[0],
        score: 0,
        replyCount: 0,
        viewCount: 0,
        isPinned: false,
        isLocked: false,
        isBestAnswer: null,
        tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      })

      await updateDoc(doc(db, "categories", categoryId), {
        threadCount: increment(1),
      })
      await updateDoc(doc(db, "profiles", user.uid), {
        threadCount: increment(1),
      })

      router.push(`/t/${slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصل خطأ")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="content-wrap space-y-5">
      <div className="breadcrumb">
        <Link href="/" className="inline-flex items-center gap-1"><HiHome className="text-sm" /> الرئيسية</Link>
        <HiChevronLeft className="text-xs" />
        <span>سؤال جديد</span>
      </div>

      {!user && (
        <div className="surface-card p-8 text-center">
          <LogIn className="mx-auto h-10 w-10 muted" />
          <h2 className="mt-4 text-xl font-extrabold text-white">لازم تسجل دخولك</h2>
          <p className="mt-2 text-sm muted">مش هتقدر تنشر موضوع جديد إلا بعد تسجيل الدخول</p>
          <Button asChild variant="primary" className="mt-5">
            <Link href="/login"><LogIn className="h-4 w-4" /> دخول</Link>
          </Button>
        </div>
      )}

      {user && <div className="editor-grid items-start">
        <section className="surface-card hero-panel px-5 py-6 md:px-7">
          <span className="eyebrow">سؤال واضح = حل أسرع</span>
          <h1 className="mt-4 page-title text-3xl md:text-4xl">اكتب مشكلتك بوضوح عشان تلاقي الحل بسرعة</h1>
          <p className="mt-4 page-desc">السؤال الواضح مش بس هيساعدك دلوقتي—كمان هيبقى مرجع لحد تاني عنده نفس المشكلة.</p>
          <div className="mt-6 grid gap-3">
            <div className="surface-soft p-4 text-sm muted">
              <div className="mb-2 flex items-center gap-2 font-bold text-white"><HiLightningBolt className="accent-text" /> نصيحة للصياغة</div>
              <p>حدد المشكلة، اذكر إيه اللي جربته، وفين ظهر العطل. كده الرد هيوصلك أسرع.</p>
            </div>
            <div className="surface-soft p-4 text-sm muted">
              <div className="mb-2 flex items-center gap-2 font-bold text-white"><HiPencilAlt className="accent-text" /> خلّي بالك</div>
              <p>العنوان القوي يجذب النظر، لكن الشرح الواضح هو اللي يجيبلك الحل.</p>
            </div>
          </div>
        </section>

        <section className="surface-card p-5 md:p-7">
          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-white">اكتب سؤالك</h2>
            <p className="mt-2 text-sm muted">اختار القسم المناسب، واشرح مشكلتك بشكل مباشر.</p>
          </div>

          {error && <div className="notice notice-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>القسم</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger><SelectValue placeholder="اختار القسم..." /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>العنوان</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="مثال: مشكلة في تثبيت بايثون على ويندوز 11" />
            </div>

            <div>
              <Label>وسوم (اختياري، حد أقصى 5)</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag() } }} placeholder="اكتب وسماً وضغط Enter" />
                <Button type="button" variant="outline" onClick={addTag}>إضافة</Button>
              </div>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <Badge key={t} variant="brand" className="cursor-pointer" onClick={() => removeTag(t)}>
                      {t} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>تفاصيل المشكلة</Label>
              <RichEditor value={body} onChange={setBody} placeholder="اشرح المشكلة: إيه اللي حصل، إيه اللي جربته، وأي رسائل خطأ ظهرت..." />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" disabled={sending} variant="primary">
                {sending ? "جارٍ النشر..." : "انشر السؤال"}
              </Button>
              <Button type="button" onClick={() => router.back()} variant="outline">رجوع</Button>
            </div>
          </form>
        </section>
      </div>}
    </div>
  )
}
