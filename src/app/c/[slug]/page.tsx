"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { ArrowLeft, BookOpen, MessageSquare, Plus, Pin, Sparkles } from "lucide-react"
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc, startAfter, getCountFromServer, type DocumentSnapshot } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import Pagination from "@/components/Pagination"

const PAGE_SIZE = 15

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<any>(null)
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [cursors, setCursors] = useState<(DocumentSnapshot | null)[]>([null])

  const loadPage = useCallback(async (pageNum: number, cursor: DocumentSnapshot | null) => {
    if (!category) return
    setLoading(true)

    try {
      let q = query(
        collection(db, "threads"),
        where("categoryId", "==", category.id),
        orderBy("isPinned", "desc"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE),
      )
      if (cursor) q = query(q, startAfter(cursor))

      const tSnap = await getDocs(q)
      const items = tSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

      setThreads(items)
      setPage(pageNum)

      if (tSnap.docs.length > 0) {
        const newCursors = [...cursors]
        newCursors[pageNum] = tSnap.docs[tSnap.docs.length - 1]
        setCursors(newCursors)
      }
    } finally {
      setLoading(false)
    }
  }, [category, cursors])

  useEffect(() => {
    async function load() {
      const catRef = doc(db, "categories", slug as string)
      const catSnap = await getDoc(catRef)
      if (!catSnap.exists()) { setLoading(false); return }
      const cat = { id: catSnap.id, ...catSnap.data() }
      setCategory(cat)

      const countSnap = await getCountFromServer(
        query(collection(db, "threads"), where("categoryId", "==", cat.id)),
      )
      setTotalPages(Math.max(1, Math.ceil(countSnap.data().count / PAGE_SIZE)))

      await loadPage(1, null)
    }
    load()
  }, [slug])

  async function goToPage(p: number) {
    if (p < 1 || p > totalPages) return
    if (cursors[p - 1] !== undefined) {
      await loadPage(p, cursors[p - 1])
    }
  }

  if (loading && !threads.length && !category) return <div className="content-wrap"><div className="surface-card p-8 text-sm muted">جارٍ التحميل...</div></div>
  if (!category) return <div className="content-wrap"><div className="surface-card p-8 text-sm muted">القسم غير موجود</div></div>

  return (
    <div className="content-wrap space-y-5">
      <PageHeader
        eyebrow={`${category.icon} ${category.name}`}
        title={category.description}
        description={`${category.threadCount ?? 0} موضوع`}
        actions={
          <Button asChild variant="primary">
            <Link href={`/t/new?cat=${category.id}`}>
              <Plus className="h-4 w-4" />
              أضف موضوعًا جديدًا
            </Link>
          </Button>
        }
      />

      <div className="flex items-center gap-2 text-sm breadcrumb">
        <Link href="/">الرئيسية</Link>
        <span className="text-xs opacity-50">/</span>
        <span>{category.name}</span>
      </div>

      {threads.length === 0 ? (
        <Card padding="lg" className="text-center">
          <Sparkles className="mx-auto h-10 w-10 accent-text" />
          <h3 className="mt-3 text-lg font-extrabold text-white">لا توجد موضوعات في هذا القسم بعد</h3>
          <p className="mt-2 text-sm muted">كن أول من يكتب موضوعًا في هذا القسم</p>
          <div className="mt-4">
            <Button asChild variant="primary">
              <Link href={`/t/new?cat=${category.id}`}><Plus className="h-4 w-4" /> اكتب أول موضوع</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="block-container">
          <div className="block-header">
            <span><Sparkles className="ml-1 inline h-4 w-4" />الموضوعات</span>
            <span className="muted text-sm">{category.threadCount ?? 0} موضوع</span>
          </div>
          {threads.map((thread: any, i: number) => (
            <Link key={thread.id} href={`/t/${thread.slug}`} className="node block no-underline"
              style={{ borderBottom: i < threads.length - 1 ? "1px solid rgba(224, 197, 132, 0.1)" : "none" }}>
              <div className="node-body">
                <div className="node-icon"><BookOpen className="h-5 w-5" /></div>
                <div className="node-main">
                  <div className="node-title">
                    {thread.isPinned && <Pin className="ml-1 inline h-3.5 w-3.5 text-amber-400" />}
                    {thread.title}
                  </div>
                  <div className="node-stats-row">
                    {thread.isPinned && <Badge variant="brand">مثبت</Badge>}
                    <span>المشاهدات: <strong>{thread.viewCount ?? 0}</strong></span>
                    <span>الردود: <strong>{thread.replyCount ?? 0}</strong></span>
                    <span>التصويتات: <strong>{thread.score ?? 0}</strong></span>
                  </div>
                </div>
                <div className="meta-pill">
                  اقرأ <ArrowLeft className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
          <Pagination currentPage={page} totalPages={totalPages} baseUrl={`/c/${slug}`} onPageChange={goToPage} />
        </div>
      )}
    </div>
  )
}
