"use client"

import { Flag } from "lucide-react"
import { useState } from "react"
import { collection, addDoc } from "firebase/firestore"
import { toast } from "sonner"

import { db, auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ReportButtonProps {
  targetType: "thread" | "reply"
  targetId: string
}

export default function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return
    const user = auth.currentUser
    if (!user) { toast.error("يجب تسجيل الدخول"); return }

    setSubmitting(true)
    try {
      await addDoc(collection(db, "reports"), {
        reporterUid: user.uid,
        targetType,
        targetId,
        reason: reason.trim(),
        status: "open",
        createdAt: new Date().toISOString(),
      })
      toast.success("تم الإبلاغ بنجاح")
      setOpen(false)
      setReason("")
    } catch {
      toast.error("حدث خطأ")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative">
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(!open)}
        className="gap-1.5 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-danger)]">
        <Flag className="h-3.5 w-3.5" /> بلغ
      </Button>

      {open && (
        <form onSubmit={handleSubmit}
          className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border p-4 shadow-xl backdrop-blur-xl"
          style={{ borderColor: "rgba(224, 197, 132, 0.12)", background: "rgba(18, 18, 22, 0.97)" }}>
          <Label htmlFor="report-reason" className="mb-2 block text-xs">سبب الإبلاغ</Label>
          <Textarea id="report-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            className="mb-3 resize-none" placeholder="اكتب سبب الإبلاغ..." />
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" size="sm" disabled={submitting || !reason.trim()}>
              {submitting ? "جاري..." : "إرسال"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>إلغاء</Button>
          </div>
        </form>
      )}
    </div>
  )
}
