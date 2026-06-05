import Link from 'next/link'
import { ChevronLeft, Clock, Eye, Home, MessageSquare, Search, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { safeCount, safeQuery } from '@/lib/safe-data'
import type { Thread } from '@/lib/types'

import Pagination from '@/components/Pagination'

type SearchThread = Thread & {
  author: { username: string } | null
  category: { name: string; slug: string } | null
}

function highlightTerm(text: string, term: string): string {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

function snippet(body: string, term: string, maxLen = 150): string {
  const cleaned = body.replace(/\s+/g, ' ').trim()
  if (!term) return cleaned.slice(0, maxLen) + (cleaned.length > maxLen ? '...' : '')

  const lower = cleaned.toLowerCase()
  const termLower = term.toLowerCase()
  const idx = lower.indexOf(termLower)

  if (idx === -1) {
    const truncated = cleaned.slice(0, maxLen)
    return truncated + (cleaned.length > maxLen ? '...' : '')
  }

  let start = 0
  if (idx > maxLen / 2) {
    start = idx - Math.floor(maxLen / 2)
  }

  const truncated = cleaned.slice(start, start + maxLen)
  const prefix = start > 0 ? '...' : ''
  const suffix = start + maxLen < cleaned.length ? '...' : ''

  return prefix + highlightTerm(truncated, term) + suffix
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q, page } = await searchParams
  const supabase = await createServerSupabaseClient()

  const currentPage = Math.max(1, Number(page) || 1)
  const perPage = 10

  let threads: SearchThread[] = []
  let totalCount = 0

  if (q) {
    totalCount = await safeCount(
      supabase.from('threads').select('*', { count: 'exact', head: true }).eq('status', 'published').or(`title.ilike.%${q}%,body.ilike.%${q}%`),
    )

    const safePage = Math.min(currentPage, Math.max(1, Math.ceil(totalCount / perPage)))

    threads = await safeQuery(
      supabase.from('threads').select('*, author:author_id(username), category:category_id(name, slug)').eq('status', 'published').or(`title.ilike.%${q}%,body.ilike.%${q}%`).order('created_at', { ascending: false }).range((safePage - 1) * perPage, safePage * perPage - 1).returns<SearchThread[]>(),
      [],
    )
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage))

  return (
    <div className="content-wrap space-y-5">
      <div className="breadcrumb">
        <Link href="/" className="inline-flex items-center gap-1">
          <Home className="h-4 w-4" />
          الرئيسية
        </Link>
        <ChevronLeft className="h-3 w-3" />
        <span>البحث</span>
      </div>

      <Card padding="lg">
        <div className="mb-5">
          <span className="eyebrow">ابحث داخل المنتدى</span>
          <h1 className="mt-3 text-3xl font-extrabold text-white">ابحث عن مشكلة مشابهة قبل فتح موضوع جديد</h1>
          <p className="mt-3 max-w-2xl text-sm muted">
            البحث دلوقتي بيشتغل في عنوان الموضوع والمحتوى نفسه عشان تلاقي النتائج الأدق.
          </p>
        </div>

        <form className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="ابحث عن مشكلة أو حل..."
            className="form-input flex-1"
          />
          <Button type="submit" variant="primary">
            <Search className="h-4 w-4" />
            بحث
          </Button>
        </form>
      </Card>

      {q && (
        <Card variant="block" className="overflow-hidden">
          <div className="block-header">
            <span>
              نتائج البحث عن: &quot;{q}&quot;
            </span>
            <span className="muted text-sm">{totalCount} نتيجة</span>
          </div>

          {threads.length === 0 ? (
            <div className="p-6 text-sm muted">
              لا توجد نتائج حالية. جرّب كلمات أبسط أو افتح موضوعًا جديدًا إذا كانت المشكلة مختلفة.
            </div>
          ) : (
            <div>
              {threads.map((thread, index) => (
                <Link
                  key={thread.id}
                  href={`/t/${thread.slug}`}
                  className="node block no-underline"
                  style={{
                    borderBottom:
                      index < threads.length - 1 ? '1px solid rgba(224, 197, 132, 0.1)' : 'none',
                  }}
                >
                  <div className="node-body">
                    <div className="node-icon">🧵</div>
                    <div className="node-main min-w-0">
                      <div className="node-title">{thread.title}</div>

                      {thread.body && (
                        <div
                          className="node-desc mt-1 line-clamp-2 text-sm"
                          dangerouslySetInnerHTML={{ __html: snippet(thread.body, q) }}
                        />
                      )}

                      <div className="node-stats-row mt-2 flex-wrap">
                        {thread.category && (
                          <Badge variant="brand">{thread.category.name}</Badge>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {thread.author?.username ?? 'مستخدم مجهول'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {thread.views}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {thread.replies_count}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(thread.created_at).toLocaleDateString('ar-EG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="border-t" style={{ borderColor: 'rgba(224, 197, 132, 0.1)' }}>
              <Pagination
                currentPage={Math.min(currentPage, totalPages)}
                totalPages={totalPages}
                baseUrl={`/search?q=${encodeURIComponent(q)}`}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
