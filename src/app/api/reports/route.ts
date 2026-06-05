import { NextRequest, NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  const { targetType, targetId, reason } = await req.json()

  if (!targetType || !['thread', 'reply'].includes(targetType)) {
    return NextResponse.json({ error: 'نوع البلاغ غير صالح' }, { status: 400 })
  }

  if (!targetId || typeof targetId !== 'number') {
    return NextResponse.json({ error: 'معرّف المحتوى مطلوب' }, { status: 400 })
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
    return NextResponse.json({ error: 'السبب يجب أن يكون 10 أحرف على الأقل' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason: reason.trim(),
      status: 'open',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function GET() {
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

  const { data: reports } = await supabase
    .from('reports')
    .select('*, reporter:profiles!reporter_id(username, avatar_url)')
    .order('created_at', { ascending: false })

  return NextResponse.json(reports ?? [])
}
