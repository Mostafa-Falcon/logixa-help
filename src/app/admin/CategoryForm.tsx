'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FolderPlus, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

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
          <Label>اسم القسم</Label>
          <Input
            value={name}
            onChange={(e) => {
              const value = e.target.value
              setName(value)
              if (!slug) {
                setSlug(toSlug(value))
              }
            }}
            required
            placeholder="مثال: التعليم والدراسة"
          />
        </div>

        <div>
          <Label>الأيقونة</Label>
          <Input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            maxLength={4}
            placeholder="🎓"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_0.42fr]">
        <div>
          <Label>الرابط المختصر</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(toSlug(e.target.value))}
            required
            dir="ltr"
            className="text-left"
            placeholder="education"
          />
        </div>

        <div>
          <Label>الترتيب</Label>
          <Input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            min={1}
          />
        </div>
      </div>

      <div>
        <Label>وصف القسم</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
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
