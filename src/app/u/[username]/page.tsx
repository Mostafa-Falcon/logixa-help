import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Award, Calendar, ChevronLeft, Home, MessageSquare, ThumbsUp, Trophy, User } from 'lucide-react'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { safeQuery, safeSingle } from '@/lib/safe-data'
import type { Profile, Reply, Thread } from '@/lib/types'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'

type ProfileThread = Thread & { category: { name: string; slug: string } | null }
type ProfileReply = Reply & { thread: { title: string; slug: string } | null }

const roleLabel: Record<string, string> = {
  admin: 'الإدارة',
  moderator: 'مشرف',
  trusted: 'موثوق',
  member: 'عضو',
}

const roleBadgeVariant: Record<string, 'brand' | 'accent' | 'success'> = {
  admin: 'accent',
  moderator: 'success',
  trusted: 'accent',
  member: 'brand',
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createServerSupabaseClient()

  const profile = await safeSingle(
    supabase.from('profiles').select('*').eq('username', username).single<Profile>(),
  )

  if (!profile) {
    notFound()
  }

  const threads = await safeQuery(
    supabase
      .from('threads')
      .select('*, category:category_id(name, slug)')
      .eq('author_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .returns<ProfileThread[]>(),
    [],
  )

  const replies = await safeQuery(
    supabase
      .from('replies')
      .select('*, thread:thread_id(title, slug)')
      .eq('author_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .returns<ProfileReply[]>(),
    [],
  )

  const avatarLetter = (profile.display_name || profile.username).slice(0, 1)

  return (
    <div className="content-wrap space-y-5">
      <div className="breadcrumb">
        <Link href="/" className="inline-flex items-center gap-1">
          <Home className="text-sm" />
          الرئيسية
        </Link>
        <ChevronLeft className="text-xs" />
        <span>{profile.display_name || profile.username}</span>
      </div>

      <PageHeader
        eyebrow="الملف الشخصي"
        title={profile.display_name || profile.username}
        description={profile.bio || undefined}
        icon={
          <div
            className="flex h-full w-full items-center justify-center rounded-lg text-lg font-extrabold"
            style={{
              background:
                'linear-gradient(135deg, rgba(88, 196, 170, 0.2), rgba(224, 182, 92, 0.16))',
              border: '1px solid rgba(224, 197, 132, 0.14)',
            }}
          >
            {avatarLetter}
          </div>
        }
        actions={
          <Badge variant={roleBadgeVariant[profile.role] ?? 'brand'}>
            {roleLabel[profile.role] ?? 'عضو'}
          </Badge>
        }
      />

      <div className="px-5 md:px-7">
        <div className="meta-row">
          <span className="meta-pill">
            <User className="text-sm" />
            @{profile.username}
          </span>
          <span className="meta-pill">
            <Calendar className="text-sm" />
            عضو منذ{' '}
            {new Date(profile.created_at).toLocaleDateString('ar-EG', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      <Card variant="block" padding="md">
        <h2 className="mb-4 text-lg font-extrabold text-white">إحصائيات العضو</h2>
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">
              <MessageSquare className="ml-1 inline-block text-sm" />
              الموضوعات
            </div>
            <div className="stat-value">{profile.threads_count}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">
              <ThumbsUp className="ml-1 inline-block text-sm" />
              الردود
            </div>
            <div className="stat-value">{profile.replies_count}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">
              <Trophy className="ml-1 inline-block text-sm" />
              السمعة
            </div>
            <div className="stat-value">{profile.reputation}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">
              <Award className="ml-1 inline-block text-sm" />
              النقاط
            </div>
            <div className="stat-value">{profile.reputation}</div>
          </div>
        </div>
      </Card>

      <Card variant="block">
        <div className="block-header">
          <span>أحدث الموضوعات</span>
          {threads && threads.length > 0 && (
            <span className="muted text-sm">{threads.length} موضوع</span>
          )}
        </div>

        {!threads || threads.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto text-xl text-text-dim" />
            <p className="mt-3 text-sm muted">لا توجد موضوعات بعد</p>
          </div>
        ) : (
          <div>
            {threads.map((thread, index) => (
              <div
                key={thread.id}
                className="p-4 md:p-5"
                style={{
                  borderBottom:
                    index < threads.length - 1
                      ? '1px solid rgba(224, 197, 132, 0.1)'
                      : 'none',
                }}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/t/${thread.slug}`}
                      className="font-bold text-white no-underline hover:text-accent"
                    >
                      {thread.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm muted">
                      {thread.category && (
                        <span className="badge badge-brand">{thread.category.name}</span>
                      )}
                      <span>
                        {new Date(thread.created_at).toLocaleDateString('ar-EG', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <dl className="node-stats-col mr-0 md:mr-4">
                    <dd>{thread.replies_count}</dd>
                    <dt>رد</dt>
                  </dl>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card variant="block">
        <div className="block-header">
          <span>أحدث الردود</span>
          {replies && replies.length > 0 && (
            <span className="muted text-sm">{replies.length} رد</span>
          )}
        </div>

        {!replies || replies.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto text-xl text-text-dim" />
            <p className="mt-3 text-sm muted">لا توجد ردود بعد</p>
          </div>
        ) : (
          <div>
            {replies.map((reply, index) => (
              <div
                key={reply.id}
                className="p-4 md:p-5"
                style={{
                  borderBottom:
                    index < replies.length - 1
                      ? '1px solid rgba(224, 197, 132, 0.1)'
                      : 'none',
                }}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm muted">
                    رد على{' '}
                    {reply.thread ? (
                      <Link
                        href={`/t/${reply.thread.slug}`}
                        className="font-bold text-white no-underline hover:text-accent"
                      >
                        {reply.thread.title}
                      </Link>
                    ) : (
                      <span className="text-text-dim">موضوع محذوف</span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-sm text-text-soft/80">
                    {reply.body}
                  </p>
                  <div className="flex items-center gap-3 text-xs muted">
                    <span>
                      {new Date(reply.created_at).toLocaleDateString('ar-EG', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    {reply.is_best_answer && (
                      <span className="badge badge-success">أفضل إجابة</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
