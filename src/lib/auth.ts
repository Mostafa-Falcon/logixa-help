import 'server-only'

import type { User } from '@supabase/supabase-js'

import type { Profile } from '@/lib/types'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function getCurrentUserWithProfile(): Promise<{
  user: User | null
  profile: Profile | null
}> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { user: null, profile: null }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      user,
      profile: (profile as Profile | null) ?? null,
    }
  } catch {
    return { user: null, profile: null }
  }
}
