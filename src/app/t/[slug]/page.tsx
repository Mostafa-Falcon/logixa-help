"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, CheckCircle, Eye, Home, Lock, MessageSquare, Pin, ThumbsUp, Clock } from "lucide-react"
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore"

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
      const data = tSnap.docs[0].data()
      const tId = tSnap.docs[0].id
      const t = { id: tId, ...data }
      setThread(t)

      await updateDoc(doc(db, "threads", tId), { viewCount: ((data as any).viewCount ?? 0) + 1 })

      const rSnap = await getDocs(
        query(collection(db, "replies"), where("threadId", "==", t.id)),
      )
      const all = rSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const best = all.filter((r: any) => r.isBestAnswer)
      const rest = all.filter((r: any) => !r.isBestAnswer)
      rest.sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
      setReplies([...best, ...rest])
      setLoading(false)
    }
    load()
  }, [slug])

  async function markBest(replyId: string) {
    if (!thread || !profile || profile.uid !== thread.authorUid) return
    const batch = [...replies]
    for (const r of batch) {
      await updateDoc(doc(db, "replies", r.id), { isBestAnswer: r.id === replyId })
    }
    await updateDoc(doc(db, "threads", thread.id), { isBestAnswer: replyId })
    setThread({ ...thread, isBestAnswer: replyId })
    setReplies(batch.map((r) => ({ ...r, isBestAnswer: r.id === replyId })))
  }

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
        {thread.categoryName && <Link href={`/c/${thread.categoryId}`}>{thread.categoryName}</Link>}
        {thread.categoryName && <ArrowLeft className="text-xs" />}
        <span className="text-white/80">{thread.title}</span>
      </div>

      <section className="surface-card hero-panel px-5 py-5 md:px-7">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="page-title flex-1 text-2xl md:text-3xl">
            {thread.isPinned && <Pin className="ml-2 inline h-5 w-5 text-amber-400" />}
            {thread.title}
          </h1>
          <ReportButton targetType="thread" targetId={thread.id} />
        </div>
        <div className="meta-row mt-3">
          {thread.isPinned && <Badge variant="brand">مثبت</Badge>}
          {thread.isLocked && <Badge variant="accent"><Lock className="ml-1 inline h-3 w-3" />مغلق</Badge>}
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {thread.viewCount ?? 0} مشاهدة</span>
          <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {thread.replyCount ?? 0} رد</span>
          <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {thread.score ?? 0} تصويت</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDate(thread.createdAt)}</span>
        </div>
        {thread.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {thread.tags.map((tag: string) => (
              <Badge key={tag} variant="accent">{tag}</Badge>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <Card padding="lg">
            <div className="flex gap-4">
              <VoteButtons targetType="thread" targetId={thread.id} votesCount={thread.score ?? 0} />
              <div className="prose-content min-w-0 flex-1">
                <p className="whitespace-pre-wrap text-sm leading-8">{thread.content}</p>
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
                <div key={reply.id} className={`node border-b last:border-0 ${reply.isBestAnswer ? "bg-emerald-900/10" : ""}`} style={{ borderColor: "rgba(224, 197, 132, 0.08)" }}>
                  <div className="node-body">
                    <VoteButtons targetType="reply" targetId={reply.id} votesCount={reply.score ?? 0} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <div className="avatar h-6 w-6 text-xs">{(reply.authorUsername ?? "?").slice(0, 1)}</div>
                        <span className="text-sm font-bold text-white">{reply.authorUsername ?? "زائر"}</span>
                        <span className="text-xs muted">{formatDate(reply.createdAt)}</span>
                        {reply.isBestAnswer && <Badge variant="success"><CheckCircle className="h-3 w-3" /> أفضل إجابة</Badge>}
                        {!reply.isBestAnswer && profile && profile.uid === thread.authorUid && (
                          <button type="button" onClick={() => markBest(reply.id)} className="text-xs brand-text hover:opacity-80">
                            + قبول كأفضل إجابة
                          </button>
                        )}
                      </div>
                      <div className="prose-content text-sm leading-8 whitespace-pre-wrap">{reply.content}</div>
                      <div className="mt-3 flex items-center gap-3">
                        <ReportButton targetType="reply" targetId={reply.id} />
                        <button type="button" className="text-xs muted hover:text-white" onClick={() => {
                          document.getElementById("reply-form")?.scrollIntoView({ behavior: "smooth" })
                        }}>
                          ↩ رد على هذا الرد
                        </button>
                      </div>
                    </div>
                  </div>
                  {reply.isBestAnswer && thread.isBestAnswer === reply.id && (
                    <div className="px-6 pb-3 text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> تم اختيارها كأفضل إجابة بواسطة {thread.authorUsername}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {thread.isLocked ? (
            <Card variant="soft" padding="md" id="reply-form">
              <p className="text-sm muted text-center">هذا الموضوع مغلق — لا يمكن إضافة ردود جديدة.</p>
            </Card>
          ) : (
            <Card padding="md" id="reply-form">
              <h3 className="mb-3 text-base font-extrabold text-white">اكتب ردك</h3>
              <ReplyForm threadId={thread.id} />
            </Card>
          )}
        </div>

        <aside className="space-y-4">
          <Card variant="soft" padding="md">
            <h4 className="mb-3 text-sm font-bold text-white">حول الموضوع</h4>
            <div className="space-y-2 text-xs muted">
              <p>المشاهدات: {thread.viewCount ?? 0}</p>
              <p>الردود: {thread.replyCount ?? 0}</p>
              <p>التصويتات: {thread.score ?? 0}</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
