import { TrendingUp, User, Users } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { safeCount, safeQuery } from '@/lib/safe-data'

export default async function Sidebar({
  categoryId,
}: {
  categoryId?: number
}) {
  const supabase = await createServerSupabaseClient()

  let totalThreadsQuery = supabase.from('threads').select('*', { count: 'exact', head: true })
  if (categoryId) {
    totalThreadsQuery = totalThreadsQuery.eq('category_id', categoryId)
  }

  const [totalThreads, totalUsers, totalReplies] = await Promise.all([
    safeCount(totalThreadsQuery),
    safeCount(supabase.from('profiles').select('*', { count: 'exact', head: true })),
    safeCount(supabase.from('replies').select('*', { count: 'exact', head: true })),
  ])

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const onlineUsers = await safeCount(
    supabase.from('user_sessions').select('*', { count: 'exact', head: true }).gte('last_seen_at', fifteenMinutesAgo),
  )

  const latestUser = await safeQuery(
    supabase.from('profiles').select('username').order('created_at', { ascending: false }).limit(1).single<{ username: string }>(),
    null,
  )

  return (
    <aside className="space-y-5">
      <Card variant="soft" className="p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          <TrendingUp className="h-4 w-4 accent-text" />
          إحصائيات
        </div>

        <div className="space-y-3">
          <StatCard label="الموضوعات" value={totalThreads} />
          <StatCard label="الأعضاء" value={totalUsers} />
          <StatCard label="الردود" value={totalReplies} />
        </div>
      </Card>

      <Card variant="soft" className="p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          <Users className="h-4 w-4 accent-text" />
          متصلون الآن
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{
              background:
                'linear-gradient(135deg, rgba(88, 196, 170, 0.2), rgba(224, 182, 92, 0.16))',
              border: '1px solid rgba(224, 197, 132, 0.14)',
            }}
          >
            <Users className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{onlineUsers}</div>
            <div className="text-xs muted">مستخدم نشط</div>
          </div>
        </div>
      </Card>

      {latestUser?.username && (
        <Card variant="soft" className="p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
            <User className="h-4 w-4 accent-text" />
            آخر عضو
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-extrabold"
              style={{
                background:
                  'linear-gradient(135deg, rgba(88, 196, 170, 0.2), rgba(224, 182, 92, 0.16))',
                border: '1px solid rgba(224, 197, 132, 0.14)',
              }}
            >
              {latestUser.username.slice(0, 1)}
            </div>
            <div className="text-sm font-bold text-white">{latestUser.username}</div>
          </div>
        </Card>
      )}
    </aside>
  )
}
