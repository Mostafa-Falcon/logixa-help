'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FolderPlus, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

function toSlug(value: string) {
  return value
    .trim()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 90)
}

export default function CategoryForm({ nextSortOrder }: { nextSortOrder: number }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('💬')
  const [sortOrder, setSortOrder] = useState(String(nextSortOrder))
  const [saving, setSaving] = useState(false)

  function resetForm() {
    setName('')
    setSlug('')
    setDescription('')
    setIcon('💬')
    setSortOrder(String(nextSortOrder))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug: slug || toSlug(name),
        description,
        icon,
        sort_order: Number(sortOrder),
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      toast.error(data.error ?? 'تعذر إنشاء القسم')
      return
    }

    toast.success('تم إنشاء القسم', {
      description: `القسم "${data.name}" أصبح جاهزًا للاستخدام.`,
    })
    resetForm()
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-[1fr_0.75fr]">
        <div>
          <label className="form-label">اسم القسم</label>
          <input
            value={name}
            onChange={(e) => {
              const value = e.target.value
              setName(value)
              if (!slug) {
                setSlug(toSlug(value))
              }
            }}
            required
            className="form-input"
            placeholder="مثال: التعليم والدراسة"
          />
        </div>

        <div>
          <label className="form-label">الأيقونة</label>
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="form-input"
            maxLength={4}
            placeholder="🎓"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_0.42fr]">
        <div>
          <label className="form-label">الرابط المختصر</label>
          <input
            value={slug}
            onChange={(e) => setSlug(toSlug(e.target.value))}
            required
            dir="ltr"
            className="form-input text-left"
            placeholder="education"
          />
        </div>

        <div>
          <label className="form-label">الترتيب</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="form-input"
            min={1}
          />
        </div>
      </div>

      <div>
        <label className="form-label">وصف القسم</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="form-input resize-y"
          placeholder="اكتب وصفًا واضحًا يساعد الزائر وجوجل يفهموا القسم بسرعة."
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" disabled={saving}>
          <FolderPlus className="h-4 w-4" />
          {saving ? 'جارٍ الإضافة...' : 'إضافة قسم'}
        </Button>
        <Button type="button" variant="outline" onClick={resetForm}>
          <RotateCcw className="h-4 w-4" />
          تفريغ
        </Button>
      </div>
    </form>
  )
}
