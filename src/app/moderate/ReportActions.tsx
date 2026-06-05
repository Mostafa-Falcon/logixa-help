'use client'

import { useRouter } from 'next/navigation'
import { Check, EyeOff, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

export default function ReportActions({
  reportId,
  status,
}: {
  reportId: number
  status: string
}) {
  const router = useRouter()

  async function updateReport(
    newStatus: string,
    action?: string,
  ) {
    const res = await fetch(`/api/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        action
          ? { status: newStatus, action }
          : { status: newStatus },
      ),
    })

    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error ?? 'حدث خطأ')
      return
    }

    toast.success('تم تحديث البلاغ')
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="primary"
        size="sm"
        onClick={() => updateReport('resolved')}
      >
        <Check className="h-4 w-4" />
        حل
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateReport('dismissed')}
      >
        <X className="h-4 w-4" />
        رفض
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => updateReport('resolved', 'hide_thread')}
      >
        <EyeOff className="h-4 w-4" />
        إخفاء المحتوى
      </Button>
    </div>
  )
}
