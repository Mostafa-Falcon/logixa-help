import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function buildUrl(baseUrl: string, page: number): string {
  const sep = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${sep}page=${page}`
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('ellipsis')
  }

  if (total > 1) {
    pages.push(total)
  }

  return pages
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: {
  currentPage: number
  totalPages: number
  baseUrl: string
}) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav className="flex items-center justify-center gap-2 p-4" aria-label="التنقل بين الصفحات">
      {currentPage > 1 ? (
        <Link
          href={buildUrl(baseUrl, currentPage - 1)}
          className="btn btn-outline inline-flex items-center gap-1 px-3 py-2 text-sm no-underline"
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </Link>
      ) : (
        <span className="btn btn-outline inline-flex items-center gap-1 px-3 py-2 text-sm no-underline opacity-40 cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
          السابق
        </span>
      )}

      {pages.map((page, i) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm muted">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(baseUrl, page)}
            className={cn(
              'meta-pill inline-flex items-center justify-center px-3 py-1.5 text-sm no-underline',
              page === currentPage && 'bg-white/10 text-white font-bold',
            )}
          >
            {page}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildUrl(baseUrl, currentPage + 1)}
          className="btn btn-outline inline-flex items-center gap-1 px-3 py-2 text-sm no-underline"
        >
          التالي
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="btn btn-outline inline-flex items-center gap-1 px-3 py-2 text-sm no-underline opacity-40 cursor-not-allowed">
          التالي
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}
