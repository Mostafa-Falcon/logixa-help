'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { HiLockClosed, HiLogin, HiSparkles } from 'react-icons/hi'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()

    if (data.error) {
      setError(data.error)
      setSending(false)
      return
    }

    router.push(searchParams.get('next') || data.redirectTo || '/')
    router.refresh()
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
            <p className="mt-2 text-sm muted">اكتب بياناتك وابدأ مباشرة.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="notice notice-error">{error}</div>}

            <div>
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
              />
            </div>

            <div>
              <Label>كلمة السر</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="اكتب كلمة السر"
              />
            </div>

            <button type="submit" disabled={sending} className="btn btn-primary w-full">
              <HiLogin className="text-base" />
              {sending ? 'جارٍ تسجيل الدخول...' : 'دخول'}
            </button>
          </form>

          <p className="mt-5 text-sm muted">
            لا تملك حسابًا؟{' '}
            <Link href="/register" className="brand-text font-bold hover:opacity-90">
              أنشئ حسابًا من هنا
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="content-wrap">
          <div className="surface-card p-8 text-center text-sm muted">جارٍ تحميل صفحة الدخول...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
