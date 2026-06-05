'use client'

import { useEffect, useState } from 'react'
import { FileText, Save, User } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

export default function SettingsForm() {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) throw new Error('فشل تحميل الملف الشخصي')
        const data = await res.json()
        setDisplayName(data.profile?.display_name ?? '')
        setBio(data.profile?.bio ?? '')
      } catch {
        toast.error('تعذر تحميل بيانات الملف الشخصي')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName, bio }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'حدث خطأ أثناء الحفظ')
      }

      toast.success('تم تحديث الملف الشخصي بنجاح')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <section className="surface-card p-5 md:p-7">
        <div className="text-sm muted">جارٍ تحميل الإعدادات...</div>
      </section>
    )
  }

  return (
    <section className="surface-card p-5 md:p-7">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="display_name" className="form-label">
            <User className="ml-1 inline-block h-4 w-4" />
            الاسم المعروض
          </label>
          <input
            id="display_name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="form-input mt-1"
            placeholder="الاسم الذي يظهر للجميع"
            maxLength={60}
          />
          <p className="mt-1 text-xs muted">اسمك المعروض داخل المنتدى، اختياري.</p>
        </div>

        <div>
          <label htmlFor="bio" className="form-label">
            <FileText className="ml-1 inline-block h-4 w-4" />
            نبذة عنك
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="form-input mt-1 min-h-[120px]"
            placeholder="اكتب نبذة مختصرة عن نفسك، تخصصك، أو مجالك..."
            maxLength={500}
          />
          <p className="mt-1 text-xs muted">أقل من 500 حرف. تظهر في ملفك الشخصي.</p>
        </div>

        <Button type="submit" variant="primary" disabled={sending} className="w-full md:w-auto">
          <Save className="h-4 w-4" />
          {sending ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </form>
    </section>
  )
}
