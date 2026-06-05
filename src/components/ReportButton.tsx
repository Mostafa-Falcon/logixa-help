'use client'

import { Flag } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

interface ReportButtonProps {
  targetType: 'thread' | 'reply'
  targetId: number
}

export default function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reason: reason.trim() }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'فشل الإبلاغ')
      }

      toast.success('تم الإبلاغ بنجاح، شكرًا لك')
      setOpen(false)
      setReason('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء الإبلاغ')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-danger)]"
        aria-label="الإبلاغ عن هذا المحتوى"
      >
        <Flag className="h-3.5 w-3.5" />
        بلغ
      </Button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border p-4 shadow-xl backdrop-blur-xl"
          style={{
            borderColor: 'rgba(224, 197, 132, 0.12)',
            background: 'rgba(18, 18, 22, 0.97)',
          }}
        >
          <label className="mb-2 block text-xs font-bold text-white" htmlFor="report-reason">
            سبب الإبلاغ
          </label>
          <textarea
            id="report-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mb-3 w-full resize-none rounded-lg border bg-transparent p-2.5 text-sm text-white placeholder:text-[var(--color-text-dim)] focus:outline-none"
            style={{ borderColor: 'rgba(224, 197, 132, 0.15)' }}
            placeholder="اكتب سبب الإبلاغ..."
            dir="rtl"
          />
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" size="sm" disabled={submitting || !reason.trim()}>
              {submitting ? 'جاري الإرسال...' : 'إرسال'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
