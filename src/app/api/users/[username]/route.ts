import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { safeSingle } from '@/lib/safe-data'
import type { Profile } from '@/lib/types'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params

  const supabase = await createServerSupabaseClient()

  const profile = await safeSingle(
    supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single<Profile>(),
  )

  if (!profile) {
    return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
  }

  const publicProfile = {
    username: profile.username,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    role: profile.role,
    reputation: profile.reputation,
    threads_count: profile.threads_count,
    replies_count: profile.replies_count,
    created_at: profile.created_at,
  }

  return NextResponse.json({ profile: publicProfile })
}
