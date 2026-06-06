import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(req: NextRequest) {
  const threadId = req.nextUrl.searchParams.get("threadId")
  if (!threadId) return NextResponse.json({ error: "threadId required" }, { status: 400 })

  const snap = await getDocs(
    query(collection(db, "replies"), where("threadId", "==", threadId), orderBy("createdAt")),
  )
  const replies = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return NextResponse.json(replies)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { threadId, authorUid, content } = body

  if (!threadId || !content || !authorUid) {
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
  }

  const ref = await addDoc(collection(db, "replies"), {
    threadId,
    authorUid,
    content,
    parentReplyId: null,
    isBestAnswer: false,
    score: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  return NextResponse.json({ id: ref.id })
}
