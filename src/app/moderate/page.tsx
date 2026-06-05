import { redirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

import ReportActions from '@/app/moderate/ReportActions'
import { PageHeader } from '@/components/ui/page-header'
import { getCurrentUserWithProfile } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { safeCount, safeQuery } from '@/lib/safe-data'

interface Report {
  id: number
  reporter_id: string
  target_type: 'thread' | 'reply'
  target_id: number
  reason: string
  status: 'open' | 'resolved' | 'dismissed'
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  reporter: { username: string; avatar_url: string } | null
}

export default async function ModeratePage() {
  const { user, profile } = await getCurrentUserWithProfile()

  if (!user || (profile?.role !== 'admin' && profile?.role !== 'moderator')) {
    redirect('/')
  }

  const supabase = await createServerSupabaseClient()

  const reports = await safeQuery<Report[]>(
    supabase
      .from('reports')
      .select('*, reporter:profiles!reporter_id(username, avatar_url)')
      .order('created_at', { ascending: false })
      .returns<Report[]>(),
    [],
  )

  const totalReports = await safeCount(
    supabase.from('reports').select('*', { count: 'exact', head: true }),
  )

  const openReports = await safeCount(
    supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open'),
  )

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const resolvedToday = await safeCount(
    supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved')
      .gte('reviewed_at', todayStart.toISOString()),
  )

  const openReportsList = reports.filter((r) => r.status === 'open')
  const resolvedReportsList = reports.filter((r) => r.status !== 'open')

  return (
    <div className="content-wrap space-y-5">
      <PageHeader
        eyebrow="لوحة الإشراف"
        title="الإشراف على البلاغات"
        description="راجع البلاغات المقدمة من الأعضاء، واتخذ الإجراء المناسب لكل مخالفة."
        icon={<ShieldCheck className="h-6 w-6" />}
      />

      <section className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">إجمالي البلاغات</div>
          <div className="stat-value">{totalReports}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">بلاغات مفتوحة</div>
          <div className="stat-value">{openReports}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">تم الحل اليوم</div>
          <div className="stat-value">{resolvedToday}</div>
        </div>
      </section>

      <section className="block-container">
        <div className="block-header">
          <span>بلاغات مفتوحة</span>
          <span className="muted text-sm">{openReportsList.length} بلاغ</span>
        </div>

        {openReportsList.length === 0 ? (
          <div className="p-6 text-sm muted">لا توجد بلاغات مفتوحة حالياً.</div>
        ) : (
          <div>
            {openReportsList.map((report, index) => (
              <div
                key={report.id}
                className="node"
                style={{
                  borderBottom:
                    index < openReportsList.length - 1
                      ? '1px solid rgba(224, 197, 132, 0.1)'
                      : 'none',
                }}
              >
                <div className="node-body">
                  <div className="node-main">
                    <div className="node-title">
                      {report.target_type === 'thread' ? '📄 موضوع' : '💬 رد'}
                      {' — '}
                      {report.reason.slice(0, 80)}
                      {report.reason.length > 80 ? '...' : ''}
                    </div>
                    <div className="node-stats-row">
                      <span>
                        المُبلّغ:{' '}
                        <strong>
                          {report.reporter?.username ?? 'غير معروف'}
                        </strong>
                      </span>
                      <span>
                        {new Date(report.created_at).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <ReportActions reportId={report.id} status={report.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {resolvedReportsList.length > 0 && (
        <section className="block-container">
          <div className="block-header">
            <span>بلاغات تمت معالجتها</span>
            <span className="muted text-sm">
              {resolvedReportsList.length} بلاغ
            </span>
          </div>
          <div>
            {resolvedReportsList.map((report, index) => (
              <div
                key={report.id}
                className="node"
                style={{
                  borderBottom:
                    index < resolvedReportsList.length - 1
                      ? '1px solid rgba(224, 197, 132, 0.1)'
                      : 'none',
                }}
              >
                <div className="node-body">
                  <div className="node-main">
                    <div className="node-title">
                      {report.target_type === 'thread' ? '📄 موضوع' : '💬 رد'}
                      {' — '}
                      {report.reason.slice(0, 80)}
                      {report.reason.length > 80 ? '...' : ''}
                    </div>
                    <div className="node-stats-row">
                      <span>
                        المُبلّغ:{' '}
                        <strong>
                          {report.reporter?.username ?? 'غير معروف'}
                        </strong>
                      </span>
                      <span
                        className={
                          report.status === 'resolved'
                            ? 'text-green-400'
                            : 'text-amber-400'
                        }
                      >
                        {report.status === 'resolved' ? 'تم الحل' : 'مرفوض'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
