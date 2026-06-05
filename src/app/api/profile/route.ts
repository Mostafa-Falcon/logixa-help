import { NextRequest, NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مسجل' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ user, profile })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مسجل' }, { status: 401 })
  }

  const body = await req.json()
  const { display_name, bio } = body

  if (display_name !== undefined && typeof display_name !== 'string') {
    return NextResponse.json({ error: 'الاسم المعروض يجب أن يكون نصًا' }, { status: 400 })
  }

  if (bio !== undefined && typeof bio !== 'string') {
    return NextResponse.json({ error: 'النص غير صالح' }, { status: 400 })
  }

  const updates: Record<string, string> = {}
  if (display_name !== undefined) updates.display_name = display_name.slice(0, 60)
  if (bio !== undefined) updates.bio = bio.slice(0, 500)
  updates.updated_at = new Date().toISOString()

  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
