import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HiArrowLeft, HiChatAlt2, HiChevronLeft, HiHome, HiPencilAlt } from 'react-icons/hi'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { safeQuery, safeSingle } from '@/lib/safe-data'
import type { Category, Thread } from '@/lib/types'

type CategoryThread = Thread & {
  author: { username: string; avatar_url: string } | null
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const category = await safeSingle(
    supabase.from('categories').select('*').eq('slug', slug).single<Category>(),
  )

  if (!category) {
    notFound()
  }

  const threads = await safeQuery(
    supabase.from('threads').select('*, author:author_id(username, avatar_url)').eq('category_id', category.id).eq('status', 'published').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).returns<CategoryThread[]>(),
    [],
  )

  return (
    <div className="content-wrap space-y-5">
      <div className="breadcrumb">
        <Link href="/" className="inline-flex items-center gap-1">
          <HiHome className="text-sm" />
          الرئيسية
        </Link>
        <HiChevronLeft className="text-xs" />
        <span>{category.name}</span>
      </div>

      <section className="surface-card hero-panel px-5 py-6 md:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="eyebrow">قسم متخصص داخل المنتدى</span>
            <div className="flex items-center gap-3">
              <div className="node-icon text-xl">{category.icon}</div>
              <div>
                <h1 className="page-title text-3xl md:text-4xl">{category.name}</h1>
                <p className="mt-2 max-w-3xl page-desc">{category.description}</p>
              </div>
            </div>
            <div className="meta-row">
              <span className="meta-pill">الموضوعات: {category.threads_count}</span>
              <span className="meta-pill">الردود: {category.replies_count}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/t/new?cat=${category.id}`} className="btn btn-primary">
              <HiPencilAlt className="text-base" />
              اسأل في هذا القسم
            </Link>
            <Link href="/search" className="btn btn-outline">
              استكشف حلولًا مشابهة
            </Link>
          </div>
        </div>
      </section>

      {!threads || threads.length === 0 ? (
        <section className="surface-card p-8 text-center">
          <div className="mx-auto node-icon text-xl">
            <HiChatAlt2 />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-white">لسه مفيش أسئلة هنا</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm muted">
            القسم جاهز، لكن أول موضوع فيه لسه مستني أول حد يبدأ. لو سؤالك هنا، افتحه مباشرة وخلي الصفحة
            دي تبدأ تتحرك.
          </p>
          <div className="mt-5">
            <Link href={`/t/new?cat=${category.id}`} className="btn btn-primary">
              <HiPencilAlt className="text-base" />
              افتح أول سؤال
            </Link>
          </div>
        </section>
      ) : (
        <section className="block-container">
          <div className="block-header">
            <span>أحدث الموضوعات في القسم</span>
            <span className="muted text-sm">{threads.length} موضوع</span>
          </div>

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
                  <div className="node-icon">
                    {thread.is_pinned ? '📌' : <HiChatAlt2 />}
                  </div>

                  <div className="node-main">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="node-title">{thread.title}</h2>
                      {thread.is_pinned && <span className="badge badge-accent">مثبت</span>}
                    </div>

                    <div className="node-stats-row">
                      <span>
                        بواسطة <strong>{thread.author?.username ?? 'مستخدم مجهول'}</strong>
                      </span>
                      <span>
                        {new Date(thread.created_at).toLocaleDateString('ar-EG', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row">
                    <dl className="node-stats-col">
                      <dd>{thread.views}</dd>
                      <dt>مشاهدة</dt>
                    </dl>
                    <dl className="node-stats-col">
                      <dd>{thread.replies_count}</dd>
                      <dt>رد</dt>
                    </dl>
                    <div className="meta-pill self-center">
                      اقرأ الموضوع
                      <HiArrowLeft className="text-base" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
