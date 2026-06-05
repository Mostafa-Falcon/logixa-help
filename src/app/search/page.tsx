"use client"

import Link from "next/link"
import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, BookOpen, Search as SearchIcon } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"

function SearchContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q") || ""
  const [query, setQuery] = useState(q)
  const [results, setResults] = useState<any[]>([])
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!q.trim()) return
    async function load() {
      const all = await getDocs(collection(db, "threads"))
      const threads = all.docs.map((d) => ({ id: d.id, ...d.data() }))
      const filtered = threads.filter((t: any) =>
        t.title?.toLowerCase().includes(q.toLowerCase()) ||
        t.body?.toLowerCase().includes(q.toLowerCase()),
      )
      setResults(filtered)
      setSearched(true)
    }
    load()
  }, [q])

  return (
    <div className="content-wrap space-y-5">
      <PageHeader
        eyebrow="البحث في المنتدى"
        title="ابحث عن حل جاهز لمشكلتك"
        description="جرب كلمات مفتاحية مختلفة — غالبًا مشكلتك اتطرق لها قبل كده"
      />

      <Card padding="md">
        <form action="/search" method="GET" className="flex gap-3">
          <Input
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مشكلة أو كلمة مفتاحية..."
            className="flex-1"
          />
          <Button type="submit" variant="primary">
            <SearchIcon className="h-4 w-4" /> بحث
          </Button>
        </form>
      </Card>

      {searched && (
        <section>
          <h3 className="mb-3 text-lg font-extrabold text-white">نتائج البحث عن "{q}"</h3>
          {results.length === 0 ? (
            <Card padding="md" className="text-center muted">لا توجد نتائج. جرب كلمات مختلفة.</Card>
          ) : (
            <div className="space-y-2">
              {results.map((t: any) => (
                <Card key={t.id} variant="section" className="node block p-4 no-underline">
                  <Link href={`/t/${t.slug}`} className="block">
                    <div className="flex items-start gap-4">
                      <div className="node-icon"><BookOpen className="h-5 w-5" /></div>
                      <div className="node-main">
                        <div className="node-title">{t.title}</div>
                        <div className="node-stats-row">
                          <span>المشاهدات: <strong>{t.views ?? 0}</strong></span>
                          <span>الردود: <strong>{t.replies_count ?? 0}</strong></span>
                        </div>
                      </div>
                      <div className="meta-pill">
                        اقرأ <ArrowLeft className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="content-wrap"><div className="surface-card p-8 text-sm muted">جارٍ التحميل...</div></div>}>
      <SearchContent />
    </Suspense>
  )
}
