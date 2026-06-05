import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HiChatAlt2, HiChevronLeft, HiEye, HiHome, HiSparkles } from 'react-icons/hi'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { safeQuery, safeRpc, safeSingle } from '@/lib/safe-data'
import type { Reply, Thread } from '@/lib/types'

import VoteButtons from '@/components/VoteButtons'
import ReportButton from '@/components/ReportButton'
import ReplyForm from './ReplyForm'

export const dynamic = 'force-dynamic'

type ThreadDetails = Thread & {
  author: { username: string; avatar_url: string } | null
  category: { name: string; slug: string } | null
}

type ThreadReply = Reply & {
  author: { username: string; avatar_url: string } | null
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const threadData = await safeSingle(
    supabase.from('threads').select('*, author:author_id(username, avatar_url), category:category_id(name, slug)').eq('slug', slug).single<ThreadDetails>(),
  )

  if (!threadData) {
    notFound()
  }

  const thread = threadData

  await safeRpc(supabase.rpc('increment_thread_views', { thread_id: thread.id }))

  const replies = await safeQuery(
    supabase.from('replies').select('*, author:author_id(username, avatar_url)').eq('thread_id', thread.id).eq('status', 'visible').order('created_at', { ascending: true }).returns<ThreadReply[]>(),
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
        {thread.category && (
          <>
            <Link href={`/c/${thread.category.slug}`}>{thread.category.name}</Link>
            <HiChevronLeft className="text-xs" />
          </>
        )}
        <span className="truncate max-w-full md:max-w-[480px]">{thread.title}</span>
      </div>

      <section className="surface-card hero-panel px-5 py-6 md:px-7">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {thread.is_pinned && <span className="badge badge-accent">موضوع مثبت</span>}
            {thread.category && <span className="badge badge-brand">{thread.category.name}</span>}
          </div>

          <h1 className="page-title text-3xl md:text-4xl">{thread.title}</h1>

          <div className="meta-row">
            <span className="meta-pill">
              <HiEye className="text-base" />
              {thread.views} مشاهدة
            </span>
            <span className="meta-pill">
              <HiChatAlt2 className="text-base" />
              {thread.replies_count} رد
            </span>
            <span className="meta-pill">
              بواسطة <strong>{thread.author?.username ?? 'مستخدم مجهول'}</strong>
            </span>
            <span className="meta-pill">
              {new Date(thread.created_at).toLocaleDateString('ar-EG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="meta-pill">
              <VoteButtons targetType="thread" targetId={thread.id} initialVotes={thread.votes_count} initialUserVote={null} />
            </span>
            <ReportButton targetType="thread" targetId={thread.id} />
          </div>
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="grid gap-0 md:grid-cols-[240px_1fr]">
          <aside
            className="border-b p-5 md:border-b-0 md:border-l"
            style={{ borderColor: 'rgba(224, 197, 132, 0.1)' }}
          >
            <div className="flex items-center gap-3 md:flex-col md:items-start">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-lg text-lg font-extrabold"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(88, 196, 170, 0.2), rgba(224, 182, 92, 0.16))',
                  border: '1px solid rgba(224, 197, 132, 0.14)',
                }}
              >
                {(thread.author?.username ?? '?').slice(0, 1)}
              </div>
              <div className="space-y-1">
                <div className="text-lg font-extrabold text-white">
                  {thread.author?.username ?? 'مستخدم مجهول'}
                </div>
                <div className="text-sm muted">صاحب الموضوع</div>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm muted">
              <div className="surface-soft p-3">
                الصفحة دي مهمة لأنها غالبًا هتبقى أول نقطة دخول من البحث، فالمحتوى لازم يبان واضح وسهل
                الفهم من أول نظرة.
              </div>
              <div className="meta-row">
                <span className="badge badge-brand">قراءة مريحة</span>
                <span className="badge badge-accent">قابل للفهرسة</span>
              </div>
            </div>
          </aside>

          <article className="p-5 md:p-7">
            <div className="prose-content whitespace-pre-line text-base leading-8">{thread.body}</div>
          </article>
        </div>
      </section>

      <section className="block-container">
        <div className="block-header">
          <span>الردود ({replies?.length ?? 0})</span>
          <span className="muted text-sm">كل رد واضح ومفصول لتسهيل القراءة</span>
        </div>

        {!replies || replies.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto node-icon text-xl">
              <HiSparkles />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-white">لسه مفيش ردود</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm muted">
              أول رد هنا ممكن يبقى أهم من الموضوع نفسه، لأنه غالبًا هو الحل اللي الزائر بيدور عليه.
            </p>
          </div>
        ) : (
          <div>
            {replies.map((reply, index) => (
              <div
                key={reply.id}
                className="p-5 md:p-6"
                style={{
                  borderBottom:
                    index < replies.length - 1 ? '1px solid rgba(224, 197, 132, 0.1)' : 'none',
                }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(88, 196, 170, 0.2), rgba(224, 182, 92, 0.16))',
                          border: '1px solid rgba(224, 197, 132, 0.14)',
                        }}
                      >
                        {(reply.author?.username ?? '?').slice(0, 1)}
                      </div>
                      <div className="text-sm font-bold text-white">
                        {reply.author?.username ?? 'مستخدم مجهول'}
                      </div>
                      <span className="text-sm muted">
                        {new Date(reply.created_at).toLocaleDateString('ar-EG', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      {reply.is_best_answer && <span className="badge badge-success">أفضل إجابة</span>}
                    </div>

                    <p className="whitespace-pre-line text-sm leading-8 text-slate-100/90">
                      {reply.body}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="meta-pill">#{index + 1}</span>
                    <VoteButtons targetType="reply" targetId={reply.id} initialVotes={reply.votes_count} initialUserVote={null} />
                    <ReportButton targetType="reply" targetId={reply.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="surface-card p-5 md:p-6">
        <div className="mb-4">
          <span className="eyebrow">أضف ردًا مفيدًا</span>
          <h2 className="mt-2 text-2xl font-extrabold text-white">شارك بحل واضح ومباشر</h2>
          <p className="mt-2 text-sm muted">
            الردود القصيرة أحيانًا تنفع، لكن الرد اللي فيه خطوة أو سبب أو ملاحظة غالبًا هو اللي بيكسب.
          </p>
        </div>
        <ReplyForm threadId={thread.id} />
      </section>
    </div>
  )
}
