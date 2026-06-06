"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FcGoogle } from "react-icons/fc"
import { HiShieldCheck, HiSparkles } from "react-icons/hi"
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth"

import { auth } from "@/lib/firebase"
import { createProfileIfNeeded } from "@/lib/auth-utils"

function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await createProfileIfNeeded(result.user)
          router.push("/")
        }
      })
      .catch((err) => {
        if (err.code !== "auth/credential-already-in-use") {
          setError(err instanceof Error ? err.message : "فشل إنشاء الحساب")
        }
      })
  }, [router])

  function handleGoogleSignIn() {
    setSending(true)
    setError("")
    const provider = new GoogleAuthProvider()
    signInWithRedirect(auth, provider)
  }

  return (
    <div className="content-wrap">
      <div className="auth-grid items-start">
        <section className="surface-card hero-panel px-5 py-6 md:px-7">
          <span className="eyebrow">انضم للمجتمع العربي</span>
          <h1 className="mt-4 page-title text-3xl md:text-4xl">أنشئ حسابك وشارك في كل المجالات</h1>
          <p className="mt-4 page-desc">
            حساب واحد يخليك تطرح أسئلتك، تشارك بخبرتك، وتكون جزء من مجتمع عربي بيجمع كل المجالات.
          </p>
          <div className="mt-6 grid gap-3">
            <div className="surface-soft p-4 text-sm muted">
              <div className="mb-2 flex items-center gap-2 font-bold text-white">
                <HiSparkles className="accent-text" />
                سهل وسريع
              </div>
              <p>تسجيل الدخول بـ Google، ومفيش استمارات طويلة. حسابك جاهز في ثواني.</p>
            </div>
            <div className="surface-soft p-4 text-sm muted">
              <div className="mb-2 flex items-center gap-2 font-bold text-white">
                <HiShieldCheck className="accent-text" />
                من غير تعقيد
              </div>
              <p>مفيش صلاحيات معقدة ولا شروط. كل اللي عليك إنك تشارك محترم ومفيد.</p>
            </div>
          </div>
        </section>

        <section className="surface-card p-5 md:p-7">
          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-white">إنشاء حساب جديد</h2>
            <p className="mt-2 text-sm muted">سجل بـ Google، والحساب هيتعمل لك تلقائي.</p>
          </div>

          {error && <div className="notice notice-error mb-4">{error}</div>}

          <button type="button" disabled={sending} onClick={handleGoogleSignIn} className="btn btn-outline w-full gap-3">
            <FcGoogle className="text-xl" />
            {sending ? "جارٍ التحميل..." : "سجل بحساب Google"}
          </button>

          <p className="mt-5 text-sm muted">
            عندك حساب قبل كده؟{" "}
            <Link href="/login" className="brand-text font-bold hover:opacity-90">
              ادخل من هنا
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="content-wrap"><div className="surface-card p-8 text-center text-sm muted">جارٍ التحميل...</div></div>}>
      <RegisterForm />
    </Suspense>
  )
}
