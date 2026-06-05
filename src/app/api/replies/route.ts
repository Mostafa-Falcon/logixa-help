import { NextRequest, NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const body = await req.json()
  const { thread_id, body: content } = body

  if (!thread_id || !content) {
    return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('replies')
    .insert({
      thread_id,
      author_id: user.id,
      body: content,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Notify thread author
  const { data: thread } = await supabase
    .from('threads')
    .select('author_id, title, slug')
    .eq('id', thread_id)
    .single()

  if (thread && thread.author_id !== user.id) {
    await createNotification({
      userId: thread.author_id,
      type: 'reply',
      title: 'رد جديد على موضوعك',
      body: `وصل رد جديد على موضوع "${thread.title.slice(0, 80)}"`,
      link: `/t/${thread.slug}`,
    })
  }

  return NextResponse.json(data)
}
