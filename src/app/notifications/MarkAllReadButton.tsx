'use client'

import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

export default function MarkAllReadButton() {
  const router = useRouter()

  async function handleClick() {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })

      if (!res.ok) throw new Error('فشل تحديث الإشعارات')

      toast.success('تم تحديد الكل كمقروء')
      router.refresh()
    } catch {
      toast.error('حدث خطأ أثناء تحديث الإشعارات')
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleClick}>
      <CheckCheck className="h-4 w-4" />
      تحديد الكل كمقروء
    </Button>
  )
}
