import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(req: NextRequest) {
  const cat = req.nextUrl.searchParams.get("categoryId")
  const latest = req.nextUrl.searchParams.get("latest")
  const page = Number(req.nextUrl.searchParams.get("page") || "1")
  const pageSize = 20

  let q = query(collection(db, "threads"), orderBy("createdAt", "desc"))
  const snap = await getDocs(q)
  let threads = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  if (cat) threads = threads.filter((t: any) => t.categoryId === cat)
  if (latest) threads = threads.slice(0, Number(latest))

  const total = threads.length
  const paged = threads.slice((page - 1) * pageSize, page * pageSize)

  return NextResponse.json({ threads: paged, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { categoryId, authorUid, title, slug, content } = body

  if (!title || !content || !authorUid || !categoryId) {
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
  }

  const ref = await addDoc(collection(db, "threads"), {
    categoryId,
    authorUid,
    authorUsername: body.authorUsername || "",
    title,
    slug,
    content,
    score: 0,
    replyCount: 0,
    viewCount: 0,
    isPinned: false,
    isLocked: false,
    isBestAnswer: null,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
  })

  return NextResponse.json({ id: ref.id, slug })
}
