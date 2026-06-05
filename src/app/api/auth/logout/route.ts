import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.json({ error: 'تعذر تسجيل الخروج الآن' }, { status: 500 })
  }

  return NextResponse.json(
    { success: true },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
