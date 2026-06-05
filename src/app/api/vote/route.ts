import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createNotification } from '@/lib/notifications'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مسجل دخول' }, { status: 401 })
  }

  const { targetType, targetId, value } = await request.json()

  if (!['thread', 'reply'].includes(targetType)) {
    return NextResponse.json({ error: 'نوع غير صالح' }, { status: 400 })
  }

  if (![1, -1].includes(value)) {
    return NextResponse.json({ error: 'قيمة غير صالحة' }, { status: 400 })
  }

  // Check existing vote
  const { data: existing } = await supabase
    .from('votes')
    .select('id, value')
    .eq('user_id', user.id)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .single()

  if (existing) {
    if (existing.value === value) {
      // Remove vote (toggle off)
      await supabase.from('votes').delete().eq('id', existing.id)
      const delta = targetType === 'thread'
        ? supabase.rpc('decrement_thread_votes', { thread_id: targetId, vote_value: value })
        : supabase.rpc('decrement_reply_votes', { reply_id: targetId, vote_value: value })
      await delta
      return NextResponse.json({ action: 'removed' })
    }

    // Change vote value
    await supabase.from('votes').update({ value }).eq('id', existing.id)
    const delta = targetType === 'thread'
      ? supabase.rpc('change_thread_votes', { thread_id: targetId, old_value: existing.value, new_value: value })
      : supabase.rpc('change_reply_votes', { reply_id: targetId, old_value: existing.value, new_value: value })
    await delta
    return NextResponse.json({ action: 'changed' })
  }

  // New vote
  await supabase.from('votes').insert({ user_id: user.id, target_type: targetType, target_id: targetId, value })
  const delta = targetType === 'thread'
    ? supabase.rpc('increment_thread_votes', { thread_id: targetId, vote_value: value })
    : supabase.rpc('increment_reply_votes', { reply_id: targetId, vote_value: value })
  await delta

  // Notify content owner (only on upvote)
  if (value === 1) {
    const table = targetType === 'thread' ? 'threads' : 'replies'
    const { data: owner } = await supabase
      .from(table)
      .select('author_id')
      .eq('id', targetId)
      .single()

    if (owner && owner.author_id !== user.id) {
      const link = targetType === 'thread'
        ? `/t/${targetId}`
        : null

      await createNotification({
        userId: owner.author_id,
        type: 'vote',
        title: 'إعجاب بمحتواك',
        body: `حصل ${targetType === 'thread' ? 'موضوعك' : 'ردك'} على تقييم إيجابي`,
        link: link ?? undefined,
      })
    }
  }

  return NextResponse.json({ action: 'created' })
}

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ votes: [] })
  }

  const { searchParams } = new URL(request.url)
  const targetType = searchParams.get('type')
  const targetIds = searchParams.get('ids')?.split(',').map(Number) ?? []

  if (!targetType || targetIds.length === 0) {
    return NextResponse.json({ votes: [] })
  }

  const { data: votes } = await supabase
    .from('votes')
    .select('target_id, value')
    .eq('user_id', user.id)
    .eq('target_type', targetType)
    .in('target_id', targetIds)

  return NextResponse.json({ votes: votes ?? [] })
}
