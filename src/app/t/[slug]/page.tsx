"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, CheckCircle, Edit3, Eye, Home, Lock, MessageSquare, Pin, ThumbsUp, Clock, Trash2, Save, X, AlertTriangle } from "lucide-react"
import { collection, getDocs, query, where, orderBy, doc, getDoc, updateDoc, deleteDoc, getCountFromServer, limit, startAfter, type DocumentSnapshot } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { VoteButtons } from "@/components/VoteButtons"
import ReportButton from "@/components/ReportButton"
import { PageHeader } from "@/components/ui/page-header"
import ReplyForm from "./ReplyForm"
import Pagination from "@/components/Pagination"

const REPLIES_PER_PAGE = 10

export default function ThreadPage() {
  const { slug } = useParams<{ slug: string }>()
  const { profile } = useAuth()
  const [thread, setThread] = useState<any>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [bestReply, setBestReply] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [replyPage, setReplyPage] = useState(1)
  const [replyTotalPages, setReplyTotalPages] = useState(1)
  const [replyCursors, setReplyCursors] = useState<(DocumentSnapshot | null)[]>([null])

  const [editingThread, setEditingThread] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [editReplyContent, setEditReplyContent] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const isAuthor = profile && thread && profile.uid === thread.authorUid
  const isMod = profile && (profile.role === "moderator" || profile.role === "admin" || profile.role === "owner")
  const canModerate = isAuthor || isMod

  useEffect(() => {
    async function load() {
      const tSnap = await getDocs(query(collection(db, "threads"), where("slug", "==", slug)))
      if (tSnap.empty) { setLoading(false); return }
      const data = tSnap.docs[0].data()
      const tId = tSnap.docs[0].id
      const t: any = { id: tId, ...data }
      setThread(t)
      setEditContent(t.content)

      await updateDoc(doc(db, "threads", tId), { viewCount: ((data as any).viewCount ?? 0) + 1 })

      const countSnap = await getCountFromServer(
        query(collection(db, "replies"), where("threadId", "==", t.id)),
      )
      setReplyTotalPages(Math.max(1, Math.ceil(countSnap.data().count / REPLIES_PER_PAGE)))

      await loadReplies(1, null, t.id)
      setLoading(false)
    }
    load()
  }, [slug])

  async function loadReplies(pageNum: number, cursor: DocumentSnapshot | null, threadId?: string) {
    const tid = threadId || thread?.id
    if (!tid) return

    try {
      let q = query(
        collection(db, "replies"),
        where("threadId", "==", tid),
        orderBy("createdAt", "asc"),
        limit(REPLIES_PER_PAGE),
      )
      if (cursor) q = query(q, startAfter(cursor))

      const rSnap = await getDocs(q)
      const items = rSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

      const best = items.filter((r: any) => r.isBestAnswer)
      const rest = items.filter((r: any) => !r.isBestAnswer)
      rest.sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))

      setBestReply(best.length > 0 ? best[0] : null)
      setReplies(rest)
      setReplyPage(pageNum)

      if (rSnap.docs.length > 0) {
        const newCursors = [...replyCursors]
        newCursors[pageNum] = rSnap.docs[rSnap.docs.length - 1]
        setReplyCursors(newCursors)
      }
    } catch {
      // silent
    }
  }

  async function goToReplyPage(p: number) {
    if (p < 1 || p > replyTotalPages) return
    if (replyCursors[p - 1] !== undefined) {
      await loadReplies(p, replyCursors[p - 1])
    }
  }

  async function markBest(replyId: string) {
    if (!thread || !profile || profile.uid !== thread.authorUid) return
    const batch = [...replies]
    for (const r of batch) {
      await updateDoc(doc(db, "replies", r.id), { isBestAnswer: r.id === replyId })
    }
    if (bestReply) {
      await updateDoc(doc(db, "replies", bestReply.id), { isBestAnswer: bestReply.id === replyId })
    }
    await updateDoc(doc(db, "threads", thread.id), { isBestAnswer: replyId })
    setThread({ ...thread, isBestAnswer: replyId })
    setBestReply((prev: any) => prev && prev.id === replyId ? { ...prev, isBestAnswer: true } : prev)
    setReplies(batch.map((r) => ({ ...r, isBestAnswer: r.id === replyId })))
  }

  async function saveThreadEdit() {
    if (!thread || !editContent.trim()) return
    await updateDoc(doc(db, "threads", thread.id), { content: editContent.trim(), updatedAt: new Date().toISOString() })
    setThread({ ...thread, content: editContent.trim() })
    setEditingThread(false)
  }

  async function saveReplyEdit(replyId: string) {
    if (!editReplyContent.trim()) return
    await updateDoc(doc(db, "replies", replyId), { content: editReplyContent.trim(), updatedAt: new Date().toISOString() })
    if (bestReply?.id === replyId) setBestReply({ ...bestReply, content: editReplyContent.trim() })
    else setReplies(replies.map((r) => r.id === replyId ? { ...r, content: editReplyContent.trim() } : r))
    setEditingReplyId(null)
  }

  async function deleteThread() {
    if (!thread || !canModerate) return
    await deleteDoc(doc(db, "threads", thread.id))
    window.location.href = `/c/${thread.categoryId}`
  }

  async function deleteReply(replyId: string) {
    if (!canModerate) return
    await deleteDoc(doc(db, "replies", replyId))
    setReplies(replies.filter((r) => r.id !== replyId))
    if (bestReply?.id === replyId) setBestReply(null)
    setDeleteConfirm(null)
  }

  async function togglePin() {
    if (!thread || !isMod) return
    const newVal = !thread.isPinned
    await updateDoc(doc(db, "threads", thread.id), { isPinned: newVal })
    setThread({ ...thread, isPinned: newVal })
  }

  async function toggleLock() {
    if (!thread || !isMod) return
    const newVal = !thread.isLocked
    await updateDoc(doc(db, "threads", thread.id), { isLocked: newVal })
    setThread({ ...thread, isLocked: newVal })
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  function renderReply(reply: any) {
    const isReplyAuthor = profile && profile.uid === reply.authorUid
    const canEdit = isReplyAuthor || isMod

    return (
      <div key={reply.id} className={`node border-b last:border-0 ${reply.isBestAnswer ? "bg-emerald-900/10" : ""}`} style={{ borderColor: "rgba(224, 197, 132, 0.08)" }}>
        <div className="node-body">
          <VoteButtons targetType="reply" targetId={reply.id} votesCount={reply.score ?? 0} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="avatar h-6 w-6 text-xs">{(reply.authorUsername ?? "?").slice(0, 1)}</div>
              <span className="text-sm font-bold text-white">{reply.authorUsername ?? "زائر"}</span>
              <span className="text-xs muted">{formatDate(reply.createdAt)}</span>
              {reply.isBestAnswer && <Badge variant="success"><CheckCircle className="h-3 w-3" /> أفضل إجابة</Badge>}
              {!reply.isBestAnswer && isAuthor && (
                <button type="button" onClick={() => markBest(reply.id)} className="text-xs brand-text hover:opacity-80">
                  + قبول كأفضل إجابة
                </button>
              )}
            </div>

            {editingReplyId === reply.id ? (
              <div className="space-y-2">
                <textarea value={editReplyContent} onChange={(e) => setEditReplyContent(e.target.value)}
                  className="w-full rounded-lg border p-3 text-sm bg-white/5 border-white/10 text-white resize-none" rows={4} />
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => saveReplyEdit(reply.id)}><Save className="h-3.5 w-3.5" /> حفظ</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingReplyId(null)}><X className="h-3.5 w-3.5" /> إلغاء</Button>
                </div>
              </div>
            ) : (
              <div className="prose-content text-sm leading-8 whitespace-pre-wrap">{reply.content}</div>
            )}

            <div className="mt-3 flex items-center gap-3">
              <ReportButton targetType="reply" targetId={reply.id} />
              {canEdit && !editingReplyId && (
                <>
                  <button type="button" onClick={() => { setEditingReplyId(reply.id); setEditReplyContent(reply.content) }} className="text-xs muted hover:text-white flex items-center gap-1">
                    <Edit3 className="h-3 w-3" /> تعديل
                  </button>
                  {deleteConfirm === reply.id ? (
                    <span className="flex items-center gap-2 text-xs">
                      <AlertTriangle className="h-3 w-3 text-red-400" />
                      <button type="button" onClick={() => deleteReply(reply.id)} className="text-red-400 hover:text-red-300">تأكيد الحذف</button>
                      <button type="button" onClick={() => setDeleteConfirm(null)} className="muted hover:text-white">إلغاء</button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setDeleteConfirm(reply.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                      <Trash2 className="h-3 w-3" /> حذف
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {reply.isBestAnswer && thread.isBestAnswer === reply.id && (
          <div className="px-6 pb-3 text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> تم اختيارها كأفضل إجابة بواسطة {thread.authorUsername}
          </div>
        )}
      </div>
    )
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
        {isMod && (
          <div className="mt-3 flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: "rgba(224, 197, 132, 0.1)" }}>
            <Button size="sm" variant="outline" onClick={togglePin}>
              <Pin className="h-3.5 w-3.5" /> {thread.isPinned ? "إلغاء التثبيت" : "تثبيت"}
            </Button>
            <Button size="sm" variant="outline" onClick={toggleLock}>
              <Lock className="h-3.5 w-3.5" /> {thread.isLocked ? "فتح" : "قفل"}
            </Button>
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <Card padding="lg">
            <div className="flex gap-4">
              <VoteButtons targetType="thread" targetId={thread.id} votesCount={thread.score ?? 0} />
              <div className="prose-content min-w-0 flex-1">
                {editingThread ? (
                  <div className="space-y-3">
                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                      className="w-full rounded-lg border p-3 text-sm bg-white/5 border-white/10 text-white resize-none" rows={6} />
                    <div className="flex gap-2">
                      <Button size="sm" variant="primary" onClick={saveThreadEdit}><Save className="h-3.5 w-3.5" /> حفظ التعديل</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingThread(false); setEditContent(thread.content) }}><X className="h-3.5 w-3.5" /> إلغاء</Button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-8">{thread.content}</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: "rgba(224, 197, 132, 0.1)" }}>
              <div className="flex items-center gap-2">
                <div className="avatar h-7 w-7 text-xs">{(thread.authorUsername ?? "?").slice(0, 1)}</div>
                <span className="text-sm muted">{thread.authorUsername ?? "زائر"}</span>
              </div>
              <div className="flex items-center gap-2">
                {isAuthor && !editingThread && (
                  <button type="button" onClick={() => setEditingThread(true)} className="text-xs muted hover:text-white flex items-center gap-1">
                    <Edit3 className="h-3 w-3" /> تعديل
                  </button>
                )}
                {isAuthor && deleteConfirm === "thread" ? (
                  <span className="flex items-center gap-2 text-xs">
                    <AlertTriangle className="h-3 w-3 text-red-400" />
                    <button type="button" onClick={deleteThread} className="text-red-400 hover:text-red-300">تأكيد حذف الموضوع</button>
                    <button type="button" onClick={() => setDeleteConfirm(null)} className="muted hover:text-white">إلغاء</button>
                  </span>
                ) : (
                  canModerate && (
                    <button type="button" onClick={() => setDeleteConfirm("thread")} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                      <Trash2 className="h-3 w-3" /> حذف
                    </button>
                  )
                )}
              </div>
            </div>
          </Card>

          <div className="block-container">
            <div className="block-header">
              <span><MessageSquare className="ml-1 inline h-4 w-4" />{thread.replyCount ?? 0} ردود</span>
            </div>
            {thread.replyCount === 0 ? (
              <div className="p-6 text-center text-sm muted">لا توجد ردود بعد. كن أول من يرد!</div>
            ) : (
              <>
                {bestReply && renderReply(bestReply)}
                {bestReply && replies.length > 0 && (
                  <hr style={{ borderColor: "rgba(224, 197, 132, 0.08)" }} />
                )}
                {replies.length > 0 ? (
                  replies.map(renderReply)
                ) : thread.replyCount > 0 && !bestReply && (
                  <div className="p-4 text-center text-sm muted">جميع الردود على الصفحات التالية</div>
                )}
                <Pagination currentPage={replyPage} totalPages={replyTotalPages} baseUrl={`/t/${slug}`} onPageChange={goToReplyPage} />
              </>
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
