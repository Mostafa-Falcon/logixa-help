import { NextRequest, NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const body = await req.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'البريد الإلكتروني وكلمة السر مطلوبان' }, { status: 400 })
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  return NextResponse.json(
    {
      success: true,
      redirectTo: profile?.role === 'admin' ? '/admin' : '/',
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
