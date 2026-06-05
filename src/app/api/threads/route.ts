import { NextRequest, NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const body = await req.json()
  const { category_id, title, body: content } = body

  if (!category_id || !title || !content) {
    return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  const slug = `${title
    .replace(/[^\w\s\u0600-\u06FF]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 80)}-${Date.now()}`

  const { data, error } = await supabase
    .from('threads')
    .insert({
      category_id,
      author_id: user.id,
      title,
      slug,
      body: content,
    })
    .select('slug')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
