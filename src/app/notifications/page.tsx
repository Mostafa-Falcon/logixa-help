import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Bell,
  BellOff,
  ChevronLeft,
  Home,
  MessageSquare,
  ShieldCheck,
  ThumbsUp,
  Trophy,
} from 'lucide-react'

import { getCurrentUserWithProfile } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { safeQuery } from '@/lib/safe-data'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'

import MarkAllReadButton from './MarkAllReadButton'

type Notification = {
  id: number
  user_id: string
  type: 'reply' | 'vote' | 'best_answer' | 'report_update' | 'mod_action'
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

const notificationIcon: Record<string, React.ReactNode> = {
  reply: <MessageSquare className="h-5 w-5" />,
  vote: <ThumbsUp className="h-5 w-5" />,
  best_answer: <Trophy className="h-5 w-5" />,
  report_update: <ShieldCheck className="h-5 w-5" />,
  mod_action: <ShieldCheck className="h-5 w-5" />,
}

export default async function NotificationsPage() {
  const { user } = await getCurrentUserWithProfile()

  if (!user) {
    redirect('/login?next=/notifications')
  }

  const supabase = await createServerSupabaseClient()

  const notifications = await safeQuery<Notification[]>(
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .returns<Notification[]>(),
    [],
  )

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="content-wrap space-y-5">
      <div className="breadcrumb">
        <Link href="/" className="inline-flex items-center gap-1">
          <Home className="h-4 w-4" />
          الرئيسية
        </Link>
        <ChevronLeft className="h-3 w-3" />
        <span>الإشعارات</span>
      </div>

      <PageHeader
        eyebrow="الإشعارات"
        title={`عندك ${unreadCount} إشعار غير مقروء`}
        description="كل اللي حصل على موضوعاتك وردودك — ردود جديدة، تصويتات، وأوسمة أفضل إجابة."
        icon={<Bell className="h-full w-full" />}
        actions={
          unreadCount > 0 ? <MarkAllReadButton /> : null
        }
      />

      <section className="block-container">
        <div className="block-header">
          <span>آخر الإشعارات</span>
          <span className="muted text-sm">{notifications.length} إشعار</span>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <BellOff className="text-3xl text-text-dim" />
            <p className="text-sm muted">مافيش إشعارات جديدة. هتلاقي هنا كل اللي يحصل على موضوعاتك.</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className="node block"
                style={{
                  borderBottom:
                    index < notifications.length - 1
                      ? '1px solid rgba(224, 197, 132, 0.1)'
                      : 'none',
                  opacity: notification.is_read ? 0.6 : 1,
                }}
              >
                {notification.link ? (
                  <Link href={notification.link} className="node-body no-underline">
                    <NotificationContent notification={notification} />
                  </Link>
                ) : (
                  <div className="node-body">
                    <NotificationContent notification={notification} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function NotificationContent({ notification }: { notification: Notification }) {
  return (
    <>
      <div
        className="node-icon"
        style={{
          color: notification.is_read
            ? 'rgba(224, 197, 132, 0.4)'
            : 'rgba(224, 182, 92, 0.9)',
        }}
      >
        {notificationIcon[notification.type] ?? <Bell className="h-5 w-5" />}
      </div>
      <div className="node-main">
        <div
          className="node-title"
          style={{
            fontWeight: notification.is_read ? 400 : 700,
          }}
        >
          {notification.title}
        </div>
        {notification.body && <div className="node-desc">{notification.body}</div>}
        <div className="node-stats-row">
          <span className="text-xs muted">
            {new Date(notification.created_at).toLocaleDateString('ar-EG', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })}
          </span>
        </div>
      </div>
    </>
  )
}
