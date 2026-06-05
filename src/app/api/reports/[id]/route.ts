import { NextRequest, NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { id } = await params
  const reportId = Number(id)

  if (Number.isNaN(reportId)) {
    return NextResponse.json({ error: 'معرّف البلاغ غير صالح' }, { status: 400 })
  }

  const { status, action } = await req.json()

  if (!status || !['resolved', 'dismissed'].includes(status)) {
    return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 })
  }

  const { data: report, error: fetchError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (fetchError || !report) {
    return NextResponse.json({ error: 'البلاغ غير موجود' }, { status: 404 })
  }

  const { data: updated, error: updateError } = await supabase
    .from('reports')
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (action === 'hide_thread') {
    await supabase
      .from('threads')
      .update({ status: 'hidden' })
      .eq('id', report.target_id)
  }

  if (action === 'hide_reply') {
    await supabase
      .from('replies')
      .update({ status: 'hidden' })
      .eq('id', report.target_id)
  }

  return NextResponse.json(updated)
}
