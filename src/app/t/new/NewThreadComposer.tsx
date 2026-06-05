'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { HiChevronLeft, HiHome, HiLightningBolt, HiPencilAlt } from 'react-icons/hi'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import type { Category } from '@/lib/types'

export default function NewThreadComposer({
  categories,
}: {
  categories: Category[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categoryId, setCategoryId] = useState(searchParams.get('cat') || '')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')

    const res = await fetch('/api/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id: Number(categoryId), title, body }),
    })
    const data = await res.json()

    if (data.error) {
      setError(data.error)
      setSending(false)
      return
    }

    if (data.slug) {
      router.push(`/t/${data.slug}`)
    }
  }

  return (
    <div className="content-wrap space-y-5">
      <div className="breadcrumb">
        <Link href="/" className="inline-flex items-center gap-1">
          <HiHome className="text-sm" />
          الرئيسية
        </Link>
        <HiChevronLeft className="text-xs" />
        <span>سؤال جديد</span>
      </div>

      <div className="editor-grid items-start">
        <section className="surface-card hero-panel px-5 py-6 md:px-7">
          <span className="eyebrow">صياغة سؤال جيد</span>
          <h1 className="mt-4 page-title text-3xl md:text-4xl">اكتب سؤالك كأنك توفر على شخص آخر ساعة كاملة</h1>
          <p className="mt-4 page-desc">
            السؤال الجيد ليس فقط ليساعدك الآن، لكنه أيضًا قد يتحول إلى صفحة قوية تظهر في البحث وتجلب ناس
            كثير لنفس المشكلة. يعني كل سؤال كويس هنا بيشتغل مرتين.
          </p>

          <div className="mt-6 grid gap-3">
            <div className="surface-soft p-4 text-sm muted">
              <div className="mb-2 flex items-center gap-2 font-bold text-white">
                <HiLightningBolt className="accent-text" />
                أفضل صيغة
              </div>
              <p>اذكر المشكلة، ما الذي جربته، وأين ظهر العطل. بهذه البساطة يبقى الرد أسرع وأذكى.</p>
            </div>
            <div className="surface-soft p-4 text-sm muted">
              <div className="mb-2 flex items-center gap-2 font-bold text-white">
                <HiPencilAlt className="accent-text" />
                تذكير صغير
              </div>
              <p>العنوان القوي يجيب الزيارة، لكن الشرح الواضح هو اللي يجيب الحل ويخلّي الصفحة تعيش.</p>
            </div>
          </div>
        </section>

        <section className="surface-card p-5 md:p-7">
          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-white">نشر موضوع جديد</h2>
            <p className="mt-2 text-sm muted">اختر القسم المناسب، ثم اشرح المشكلة بشكل مباشر.</p>
          </div>

          {error && <div className="notice notice-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>القسم</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="اختر القسم المناسب..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>العنوان</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="مثال: لماذا يتعطل ويندوز 11 بعد آخر تحديث؟"
              />
            </div>

            <div>
              <Label>شرح المشكلة</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={10}
                placeholder="اشرح المشكلة، الخطوات، الرسائل التي ظهرت، وما الذي جربته حتى الآن..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" disabled={sending} variant="primary">
                {sending ? 'جارٍ النشر...' : 'نشر السؤال'}
              </Button>
              <Button type="button" onClick={() => router.back()} variant="outline">
                إلغاء
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
