import { NextRequest, NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const body = await req.json()
  const { email, password, username } = body

  if (!email || !password || !username) {
    return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      username,
      display_name: username,
    })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }
  }

  return NextResponse.json(
    {
      success: true,
      redirectTo: authData.session ? '/' : '/login',
      needsEmailConfirmation: !authData.session,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
