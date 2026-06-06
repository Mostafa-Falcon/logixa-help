"use client"

import { useEffect, useState } from "react"
import { FileText, Save, User } from "lucide-react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { toast } from "sonner"

import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function SettingsForm() {
  const { profile, loading } = useAuth()
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "")
      setBio(profile.bio ?? "")
    }
  }, [profile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSending(true)
    try {
      await updateDoc(doc(db, "profiles", profile.id), {
        displayName,
        bio,
        updatedAt: new Date().toISOString(),
      })
      toast.success("تم تحديث بياناتك")
    } catch {
      toast.error("حصل خطأ أثناء الحفظ")
    } finally {
      setSending(false)
    }
  }

  if (loading) return <section className="surface-card p-5 md:p-7"><div className="text-sm muted">جارٍ التحميل...</div></section>

  return (
    <section className="surface-card p-5 md:p-7">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="displayName"><User className="ml-1 inline h-4 w-4" /> اسم العرض</Label>
          <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="الاسم اللي يظهر للكل" maxLength={60} />
          <p className="mt-1 text-xs muted">الاسم اللي الكل يشوفه. اختياري.</p>
        </div>

        <div>
          <Label htmlFor="bio"><FileText className="ml-1 inline h-4 w-4" /> نبذة عنك</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[120px]" placeholder="حاجة بسيطة عن نفسك" maxLength={500} />
          <p className="mt-1 text-xs muted">أقل من 500 حرف. بتظهر في صفحتك.</p>
        </div>

        <Button type="submit" variant="primary" disabled={sending} className="w-full md:w-auto">
          <Save className="h-4 w-4" /> {sending ? "جارٍ الحفظ..." : "حفظ"}
        </Button>
      </form>
    </section>
  )
}
