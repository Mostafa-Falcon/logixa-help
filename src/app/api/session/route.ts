import { NextRequest, NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مسجل' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const ipAddress = body?.ip_address ?? null
  const userAgent = body?.user_agent ?? null

  // Update or insert session
  const { data: existing } = await supabase
    .from('user_sessions')
    .select('id')
    .eq('user_id', user.id)
    .order('last_seen_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('user_sessions')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase.from('user_sessions').insert({
      user_id: user.id,
      last_seen_at: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
    })
  }

  // Count online users
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const { count: online } = await supabase
    .from('user_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen_at', fifteenMinAgo)

  return NextResponse.json({ success: true, online: online ?? 0 })
}
