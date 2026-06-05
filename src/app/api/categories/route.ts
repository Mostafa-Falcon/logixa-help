import { NextRequest, NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

function makeSlug(value: string) {
  return value
    .trim()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 90)
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const body = await req.json()

  const name = String(body.name ?? '').trim()
  const description = String(body.description ?? '').trim()
  const icon = String(body.icon ?? '💬').trim() || '💬'
  const slug = makeSlug(String(body.slug ?? '').trim() || name)

  if (!name || !slug) {
    return NextResponse.json({ error: 'اسم القسم والرابط مطلوبان' }, { status: 400 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'هذه العملية متاحة للأدمن فقط' }, { status: 403 })
  }

  const { data: lastCategory } = await supabase
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const requestedSortOrder = Number(body.sort_order)
  const sortOrder = Number.isFinite(requestedSortOrder)
    ? requestedSortOrder
    : Number(lastCategory?.sort_order ?? 0) + 1

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      slug,
      description,
      icon,
      sort_order: sortOrder,
    })
    .select('*')
    .single()

  if (error) {
    const message = error.code === '23505' ? 'هذا الرابط مستخدم بالفعل لقسم آخر' : error.message
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
