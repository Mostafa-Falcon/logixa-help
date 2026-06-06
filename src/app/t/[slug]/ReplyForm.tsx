"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogIn, Send } from "lucide-react"
import { collection, addDoc, doc, increment, updateDoc } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import RichEditor from "@/components/RichEditor"

export default function ReplyForm({ threadId, parentReplyId }: { threadId: string; parentReplyId?: string | null }) {
  const router = useRouter()
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { setError("يجب تسجيل الدخول أولاً"); return }

    setSending(true)
    setError("")

    try {
      await addDoc(collection(db, "replies"), {
        threadId,
        parentReplyId: parentReplyId ?? null,
        content,
        authorUid: user.uid,
        authorUsername: user.displayName || user.email?.split("@")[0],
        isBestAnswer: false,
        score: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      await updateDoc(doc(db, "threads", threadId), {
        replyCount: increment(1),
        lastActivityAt: new Date().toISOString(),
      })
      await updateDoc(doc(db, "profiles", user.uid), {
        replyCount: increment(1),
      })
      setContent("")
      router.refresh()
    } catch {
      setError("حدث خطأ أثناء الإرسال")
    } finally {
      setSending(false)
    }
  }

  if (!user) {
    return (
      <div className="surface-soft rounded-xl p-6 text-center">
        <LogIn className="mx-auto h-8 w-8 muted" />
        <p className="mt-3 text-sm muted">يجب تسجيل الدخول لتتمكن من الرد</p>
        <Button asChild variant="primary" className="mt-4">
          <Link href="/login"><LogIn className="h-4 w-4" /> تسجيل الدخول</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="notice notice-error">{error}</div>}

      <RichEditor value={content} onChange={setContent} placeholder="اكتب ردك بشكل واضح: ما الحل؟ لماذا نجح؟ وهل في ملاحظة مهمة لازم صاحب السؤال يعرفها؟" minHeight={150} />

      <div className="flex justify-end">
        <Button type="submit" disabled={sending} variant="primary">
          <Send className="h-4 w-4" />
          {sending ? "جارٍ الإرسال..." : "إرسال الرد"}
        </Button>
      </div>
    </form>
  )
}
