import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const threadId = url.searchParams.get("thread_id")
  if (!threadId) return NextResponse.json({ error: "thread_id required" }, { status: 400 })

  const snap = await getDocs(
    query(collection(db, "replies"), where("thread_id", "==", threadId), orderBy("created_at")),
  )
  const replies = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return NextResponse.json(replies)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { thread_id, author_id, body: content } = body

  if (!thread_id || !content || !author_id) {
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
  }

  const ref = await addDoc(collection(db, "replies"), {
    thread_id,
    author_id,
    body: content,
    is_best_answer: false,
    status: "visible",
    votes_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  return NextResponse.json({ id: ref.id })
}
