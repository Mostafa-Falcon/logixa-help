import { createServerSupabaseClient } from '@/lib/supabase-server'

type NotificationInput = {
  userId: string
  type: 'reply' | 'vote' | 'best_answer' | 'report_update' | 'mod_action'
  title: string
  body?: string
  link?: string
}

export async function createNotification(input: NotificationInput) {
  try {
    const supabase = await createServerSupabaseClient()
    await supabase.from('notifications').insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    })
  } catch {
    // silently fail — don't break the main action
  }
}
