"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Send } from "lucide-react"
import { collection, addDoc } from "firebase/firestore"

import { db, auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function ReplyForm({ threadId }: { threadId: string }) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const user = auth.currentUser
    if (!user) { setError("يجب تسجيل الدخول أولاً"); return }

    setSending(true)
    setError("")

    try {
      await addDoc(collection(db, "replies"), {
        thread_id: threadId,
        author_id: user.uid,
        authorUsername: user.displayName || user.email?.split("@")[0],
        body: content,
        is_best_answer: false,
        status: "visible",
        votes_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setContent("")
      router.refresh()
    } catch {
      setError("حدث خطأ أثناء الإرسال")
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="notice notice-error">
          {error}
          {error.includes("تسجيل الدخول") && (
            <> <Link href="/login" className="brand-text font-bold">ادخل من هنا</Link></>
          )}
        </div>
      )}

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={5}
        className="text-sm"
        placeholder="اكتب ردك بشكل واضح: ما الحل؟ لماذا نجح؟ وهل في ملاحظة مهمة لازم صاحب السؤال يعرفها؟"
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={sending} variant="primary">
          <Send className="h-4 w-4" />
          {sending ? "جارٍ الإرسال..." : "إرسال الرد"}
        </Button>
      </div>
    </form>
  )
}
