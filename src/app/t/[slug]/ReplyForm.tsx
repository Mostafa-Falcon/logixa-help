'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function ReplyForm({ threadId }: { threadId: number }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')

    const res = await fetch('/api/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thread_id: threadId, body: content }),
    })
    const data = await res.json()

    if (data.error) {
      setError(data.error)
      setSending(false)
      return
    }

    setContent('')
    setSending(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="notice notice-error">
          {error}
          {error.includes('تسجيل الدخول') && (
            <>
              {' '}
              <Link href="/login" className="brand-text font-bold">
                ادخل من هنا
              </Link>
            </>
          )}
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={5}
        className="form-input resize-y text-sm"
        placeholder="اكتب ردك بشكل واضح: ما الحل؟ لماذا نجح؟ وهل في ملاحظة مهمة لازم صاحب السؤال يعرفها؟"
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={sending} variant="primary">
          <Send className="h-4 w-4" />
          {sending ? 'جارٍ الإرسال...' : 'إرسال الرد'}
        </Button>
      </div>
    </form>
  )
}
