"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Eye, Home, MessageSquare, ThumbsUp, Clock, CheckCircle } from "lucide-react"
import { collection, getDocs, query, where, orderBy, doc, getDoc, updateDoc } from "firebase/firestore"

import { db, auth } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { VoteButtons } from "@/components/VoteButtons"
import ReportButton from "@/components/ReportButton"
import { PageHeader } from "@/components/ui/page-header"
import ReplyForm from "./ReplyForm"

export default function ThreadPage() {
  const { slug } = useParams<{ slug: string }>()
  const { profile } = useAuth()
  const [thread, setThread] = useState<any>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const tSnap = await getDocs(query(collection(db, "threads"), where("slug", "==", slug)))
      if (tSnap.empty) { setLoading(false); return }
      const t = { id: tSnap.docs[0].id, ...tSnap.docs[0].data() } as { id: string; views?: number; [key: string]: unknown }
      setThread(t)

      await updateDoc(doc(db, "threads", t.id), { views: (t.views ?? 0) + 1 })

      const rSnap = await getDocs(
        query(collection(db, "replies"), where("thread_id", "==", t.id), where("status", "==", "visible"), orderBy("created_at")),
      )
      setReplies(rSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    load()
  }, [slug])

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  if (loading) return <div className="content-wrap"><div className="surface-card p-8 text-sm muted">جارٍ التحميل...</div></div>
  if (!thread) return <div className="content-wrap"><div className="surface-card p-8 text-sm muted">الموضوع غير موجود</div></div>

  return (
    <div className="content-wrap space-y-5">
      <div className="breadcrumb">
        <Link href="/" className="inline-flex items-center gap-1"><Home className="text-sm" /> الرئيسية</Link>
        <ArrowLeft className="text-xs" />
        {thread.categoryName && <Link href={`/c/${thread.categorySlug}`}>{thread.categoryName}</Link>}
        {thread.categoryName && <ArrowLeft className="text-xs" />}
        <span className="text-white/80">{thread.title}</span>
      </div>

      <section className="surface-card hero-panel px-5 py-5 md:px-7">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="page-title flex-1 text-2xl md:text-3xl">{thread.title}</h1>
          <ReportButton targetType="thread" targetId={thread.id} />
        </div>
        <div className="meta-row mt-3">
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {thread.views ?? 0} مشاهدة</span>
          <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {thread.replies_count ?? 0} رد</span>
          <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {thread.votes_count ?? 0} تصويت</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDate(thread.created_at)}</span>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <Card padding="lg">
            <div className="flex gap-4">
              <VoteButtons targetType="thread" targetId={thread.id} votesCount={thread.votes_count ?? 0} />
              <div className="prose-content min-w-0 flex-1">
                <p className="whitespace-pre-wrap text-sm leading-8">{thread.body}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t pt-4" style={{ borderColor: "rgba(224, 197, 132, 0.1)" }}>
              <div className="avatar h-7 w-7 text-xs">{(thread.authorUsername ?? "?").slice(0, 1)}</div>
              <span className="text-sm muted">{thread.authorUsername ?? "زائر"}</span>
            </div>
          </Card>

          <div className="block-container">
            <div className="block-header">
              <span><MessageSquare className="ml-1 inline h-4 w-4" />{replies.length} ردود</span>
            </div>
            {replies.length === 0 ? (
              <div className="p-6 text-center text-sm muted">لا توجد ردود بعد. كن أول من يرد!</div>
            ) : (
              replies.map((reply: any) => (
                <div key={reply.id} className="node border-b last:border-0" style={{ borderColor: "rgba(224, 197, 132, 0.08)" }}>
                  <div className="node-body">
                    <VoteButtons targetType="reply" targetId={reply.id} votesCount={reply.votes_count ?? 0} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="avatar h-6 w-6 text-xs">{(reply.authorUsername ?? "?").slice(0, 1)}</div>
                        <span className="text-sm font-bold text-white">{reply.authorUsername ?? "زائر"}</span>
                        <span className="text-xs muted">{formatDate(reply.created_at)}</span>
                        {reply.is_best_answer && <Badge variant="success"><CheckCircle className="h-3 w-3" /> أفضل إجابة</Badge>}
                      </div>
                      <div className="prose-content text-sm leading-8 whitespace-pre-wrap">{reply.body}</div>
                      <div className="mt-3"><ReportButton targetType="reply" targetId={reply.id} /></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Card padding="md">
            <h3 className="mb-3 text-base font-extrabold text-white">اكتب ردك</h3>
            <ReplyForm threadId={thread.id} />
          </Card>
        </div>

        <aside className="space-y-4">
          <Card variant="soft" padding="md">
            <h4 className="mb-3 text-sm font-bold text-white">حول الموضوع</h4>
            <div className="space-y-2 text-xs muted">
              <p>عدد المشاهدات: {thread.views ?? 0}</p>
              <p>الردود: {thread.replies_count ?? 0}</p>
              <p>التصويتات: {thread.votes_count ?? 0}</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
