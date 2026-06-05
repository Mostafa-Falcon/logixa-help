import Link from 'next/link'
import { redirect } from 'next/navigation'
import { HiChartBar, HiDocumentText, HiEye, HiShieldCheck } from 'react-icons/hi'

import CategoryForm from '@/app/admin/CategoryForm'
import { getCurrentUserWithProfile } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { safeCount, safeQuery } from '@/lib/safe-data'
import type { Category, Thread } from '@/lib/types'

export default async function AdminPage() {
  const { user, profile } = await getCurrentUserWithProfile()

  if (!user) {
    redirect('/login?next=/admin')
  }

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  const supabase = await createServerSupabaseClient()

  const totalUsers = await safeCount(
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  )

  const totalThreads = await safeCount(
    supabase.from('threads').select('*', { count: 'exact', head: true }),
  )

  const totalReplies = await safeCount(
    supabase.from('replies').select('*', { count: 'exact', head: true }),
  )

  const categories = await safeQuery(
    supabase.from('categories').select('*').order('sort_order').returns<Category[]>(),
    [],
  )

  const threads = await safeQuery(
    supabase.from('threads').select('*').order('created_at', { ascending: false }).limit(20).returns<Thread[]>(),
    [],
  )

  const nextSortOrder = Math.max(0, ...(categories.map((category) => category.sort_order) ?? [0])) + 1

  return (
    <div className="content-wrap space-y-5">
      <section className="surface-card hero-panel px-5 py-6 md:px-7">
        <span className="eyebrow">منطقة الإدارة</span>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="node-icon">
                <HiShieldCheck />
              </div>
              <div>
                <h1 className="page-title text-3xl md:text-4xl">لوحة التحكم</h1>
                <p className="mt-2 page-desc max-w-3xl">
                  نظرة سريعة على نبض المنتدى: كم عضو عندنا، كم موضوع نُشر، وما الذي يتحرك داخل المحتوى الآن.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">الأعضاء</div>
          <div className="stat-value">{totalUsers ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">الموضوعات</div>
          <div className="stat-value">{totalThreads ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">الردود</div>
          <div className="stat-value">{totalReplies ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">الأقسام</div>
          <div className="stat-value">{categories.length}</div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="block-container">
          <div className="block-header">
            <span>الأقسام الحالية</span>
            <span className="muted text-sm">{categories.length} قسم</span>
          </div>

          {categories.length === 0 ? (
            <div className="p-6 text-sm muted">لا توجد أقسام بعد.</div>
          ) : (
            <div>
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/c/${category.slug}`}
                  className="node block no-underline"
                  style={{
                    borderBottom:
                      index < categories.length - 1 ? '1px solid rgba(224, 197, 132, 0.1)' : 'none',
                  }}
                >
                  <div className="node-body">
                    <div className="node-icon text-xl">{category.icon}</div>
                    <div className="node-main">
                      <div className="node-title">{category.name}</div>
                      <div className="node-desc">{category.description}</div>
                      <div className="node-stats-row">
                        <span>
                          الترتيب: <strong>{category.sort_order}</strong>
                        </span>
                        <span>
                          الرابط: <strong dir="ltr">/{category.slug}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <section className="surface-card p-5 md:p-6">
          <span className="eyebrow">توسيع المنتدى</span>
          <h2 className="mt-3 text-2xl font-extrabold text-white">إضافة قسم جديد</h2>
          <p className="mt-2 mb-5 text-sm muted">
            أضف قسمًا عندما يظهر طلب متكرر أو فرصة بحث واضحة. الاسم والوصف القويان يساعدان الزائر وجوجل
            يفهمان القسم من أول نظرة.
          </p>
          <CategoryForm nextSortOrder={nextSortOrder} />
        </section>
      </section>

      <section className="block-container">
        <div className="block-header">
          <span className="inline-flex items-center gap-2">
            <HiDocumentText />
            آخر الموضوعات
          </span>
          <span className="muted text-sm">آخر 20 موضوعًا</span>
        </div>

          {threads.length === 0 ? (
          <div className="p-6 text-sm muted">لا توجد موضوعات بعد.</div>
        ) : (
          <div>
            {threads.map((thread, index) => (
              <Link
                key={thread.id}
                href={`/t/${thread.slug}`}
                className="node block no-underline"
                style={{
                  borderBottom:
                    index < threads.length - 1 ? '1px solid rgba(224, 197, 132, 0.1)' : 'none',
                }}
              >
                <div className="node-body">
                  <div className="node-icon">{thread.is_pinned ? '📌' : '📝'}</div>
                  <div className="node-main">
                    <div className="node-title">{thread.title}</div>
                    <div className="node-stats-row">
                      <span>الردود: <strong>{thread.replies_count}</strong></span>
                      <span className="inline-flex items-center gap-1">
                        <HiEye className="text-sm" />
                        <strong>{thread.views}</strong> مشاهدة
                      </span>
                    </div>
                  </div>
                  <div className="meta-pill">
                    <HiChartBar className="text-base" />
                    متابعة
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
