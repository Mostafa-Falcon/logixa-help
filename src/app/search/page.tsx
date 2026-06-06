"use client"

import Link from "next/link"
import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, BookOpen, Search as SearchIcon } from "lucide-react"
import { collection, getDocs, query as fq, where, orderBy, limit as fLimit } from "firebase/firestore"

import { db } from "@/lib/firebase"
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q.trim()) return
    async function load() {
      setLoading(true)
      const term = q.trim().toLowerCase()

      try {
        const titlePrefix = fq(
          collection(db, "threads"),
          where("title", ">=", term),
          where("title", "<=", term + "\uf8ff"),
          orderBy("title"),
          fLimit(50),
        )
        const titleSnap = await getDocs(titlePrefix)
        const byTitle = new Map(titleSnap.docs.map((d) => [d.id, { id: d.id, ...d.data() }]))

        const tagPrefix = fq(
          collection(db, "threads"),
          where("tags", "array-contains", term),
          fLimit(50),
        )
        const tagSnap = await getDocs(tagPrefix)
        for (const d of tagSnap.docs) {
          if (!byTitle.has(d.id)) byTitle.set(d.id, { id: d.id, ...d.data() })
        }

        setResults(Array.from(byTitle.values()))
      } catch {
        setResults([{ id: "error", title: "تعذّر البحث الكامل، جرب كلمة مختلفة", slug: "#" }] as any)
      }
      setSearched(true)
      setLoading(false)
    }
    load()
  }, [q])

  return (
    <div className="content-wrap space-y-5">
      <PageHeader
        eyebrow="البحث"
        title="دوّر على حل لمشكلتك"
        description="جرب كلمات مختلفة—غالباً حد تاني كان عنده نفس المشكلة"
      />

      <Card padding="md">
        <form action="/search" method="GET" className="flex gap-3">
          <Input
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مشكلة أو كلمة..."
            className="flex-1"
          />
          <Button type="submit" variant="primary">
            <SearchIcon className="h-4 w-4" /> بحث
          </Button>
        </form>
      </Card>

      {searched && (
        <section>
          <h3 className="mb-3 text-lg font-extrabold text-white">نتائج بحث "{q}"</h3>
          {loading ? (
            <Card padding="md" className="text-center muted">جارٍ البحث...</Card>
          ) : results.length === 0 ? (
            <Card padding="md" className="text-center muted">مفيش نتائج. جرب كلمات تانية.</Card>
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
                          <span>مشاهدات: <strong>{t.viewCount ?? 0}</strong></span>
                          <span>ردود: <strong>{t.replyCount ?? 0}</strong></span>
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
