"use client"

import Link from "next/link"
import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { FcGoogle } from "react-icons/fc"
import { HiLockClosed, HiSparkles } from "react-icons/hi"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore"

import { auth, db } from "@/lib/firebase"

function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  async function handleGoogleSignIn() {
    setSending(true)
    setError("")

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const profileSnap = await getDoc(doc(db, "profiles", user.uid))
      if (!profileSnap.exists()) {
        const baseUsername = (user.displayName || user.email?.split("@")[0] || "user")
          .replace(/\s+/g, "_")
          .toLowerCase()
        let username = baseUsername
        for (let i = 1; i < 100; i++) {
          const existing = await getDoc(doc(db, "profiles", username))
          if (!existing.exists()) break
          username = `${baseUsername}${i}`
        }
        await setDoc(doc(db, "profiles", user.uid), {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "مستخدم جديد",
          username,
          role: "user",
          avatarUrl: user.photoURL || "",
          bio: "",
          website: "",
          github: "",
          twitter: "",
          reputation: 0,
          threadCount: 0,
          replyCount: 0,
          createdAt: Timestamp.now(),
        })
      }
      router.push("/")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "فشل تسجيل الدخول")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="content-wrap">
      <div className="auth-grid items-start">
        <section className="surface-card hero-panel px-5 py-6 md:px-7">
          <span className="eyebrow">الوصول إلى الحساب</span>
          <h1 className="mt-4 page-title text-3xl md:text-4xl">ادخل وكمّل من المكان اللي وقفت عنده</h1>
          <p className="mt-4 page-desc">
            الحساب هنا ليس مجرد تسجيل دخول. هو مفتاحك لفتح موضوعات جديدة، الرد، وبناء حضور داخل المنتدى
            من غير لف كثير.
          </p>
          <div className="mt-6 grid gap-3">
            <div className="surface-soft p-4 text-sm muted">
              <div className="mb-2 flex items-center gap-2 font-bold text-white">
                <HiSparkles className="accent-text" />
                لماذا التسجيل مهم؟
              </div>
              <p>لأن الردود والمشاركات هي اللي بتحوّل المنتدى من أرشيف ثابت لمكان فيه نبض فعلي.</p>
            </div>
            <div className="surface-soft p-4 text-sm muted">
              <div className="mb-2 flex items-center gap-2 font-bold text-white">
                <HiLockClosed className="accent-text" />
                الخصوصية أولًا
              </div>
              <p>الجلسات مربوطة بشكل صحيح على السيرفر والواجهة، علشان الدخول والخروج يفضلوا متماسكين.</p>
            </div>
          </div>
        </section>

        <section className="surface-card p-5 md:p-7">
          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-white">تسجيل الدخول</h2>
            <p className="mt-2 text-sm muted">سجل بحساب Google وابدأ فوراً.</p>
          </div>

          {error && <div className="notice notice-error mb-4">{error}</div>}

          <button type="button" disabled={sending} onClick={handleGoogleSignIn} className="btn btn-outline w-full gap-3">
            <FcGoogle className="text-xl" />
            {sending ? "جارٍ التحميل..." : "سجل بحساب Google"}
          </button>

          <p className="mt-5 text-sm muted">
            فتح حسابك لأول مرة؟ هيتعمل لك حساب تلقائي من Google. كله تمام.{" "}
            <Link href="/register" className="brand-text font-bold hover:opacity-90">
              أنشئ حسابًا
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="content-wrap"><div className="surface-card p-8 text-center text-sm muted">جارٍ تحميل صفحة الدخول...</div></div>}>
      <LoginForm />
    </Suspense>
  )
}
