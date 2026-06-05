"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { HiShieldCheck, HiSparkles, HiUserAdd } from "react-icons/hi"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

import { auth, db } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError("")

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: username })
      await setDoc(doc(db, "profiles", cred.user.uid), {
        username,
        display_name: username,
        avatar_url: "",
        bio: "",
        role: "member",
        reputation: 0,
        threads_count: 0,
        replies_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      router.push("/")
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل إنشاء الحساب"
      setError(msg)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="content-wrap">
      <div className="auth-grid items-start">
        <section className="surface-card hero-panel px-5 py-6 md:px-7">
          <span className="eyebrow">ابدأ وجودك داخل المنتدى</span>
          <h1 className="mt-4 page-title text-3xl md:text-4xl">أنشئ حسابًا بسرعة وابدأ المشاركة</h1>
          <p className="mt-4 page-desc">
            الفكرة هنا بسيطة: حساب خفيف، تجربة نظيفة، ثم دخول مباشر على كتابة الأسئلة والردود بدل الواجهة
            اللي تستهلك أعصابك في غير المفيد.
          </p>
          <div className="mt-6 grid gap-3">
            <div className="surface-soft p-4 text-sm muted">
              <div className="mb-2 flex items-center gap-2 font-bold text-white">
                <HiSparkles className="accent-text" />
                انطباع محترم
              </div>
              <p>كل جزء في المشروع بيتبنى على إن الزائر يثق في المكان من أول زيارة، مش يحس إنه صفحة مؤقتة.</p>
            </div>
            <div className="surface-soft p-4 text-sm muted">
              <div className="mb-2 flex items-center gap-2 font-bold text-white">
                <HiShieldCheck className="accent-text" />
                صلاحيات واضحة
              </div>
              <p>العضويات والأدوار متوصلة ببنية صالحة للتوسع، علشان الإدارة والـ moderation يبقوا سليمين لاحقًا.</p>
            </div>
          </div>
        </section>

        <section className="surface-card p-5 md:p-7">
          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-white">إنشاء حساب جديد</h2>
            <p className="mt-2 text-sm muted">املأ البيانات الأساسية فقط، والباقي نكمّله بعدين.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="notice notice-error">{error}</div>}

            <div>
              <Label>اسم المستخدم</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="مثال: mostafa_dev" />
            </div>

            <div>
              <Label>البريد الإلكتروني</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@email.com" />
            </div>

            <div>
              <Label>كلمة السر</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="اختر كلمة سر قوية" />
            </div>

            <button type="submit" disabled={sending} className="btn btn-primary w-full">
              <HiUserAdd className="text-base" />
              {sending ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </form>

          <p className="mt-5 text-sm muted">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="brand-text font-bold hover:opacity-90">
              ادخل من هنا
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
