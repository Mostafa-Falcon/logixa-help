import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const cat = url.searchParams.get("category_id")
  const latest = url.searchParams.get("latest")
  const page = Number(url.searchParams.get("page") || "1")
  const pageSize = 20

  let q = query(collection(db, "threads"), orderBy("created_at", "desc"))
  const snap = await getDocs(q)
  let threads = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  if (cat) threads = threads.filter((t: any) => t.category_id === cat)
  if (latest) threads = threads.slice(0, Number(latest))

  const total = threads.length
  const paged = threads.slice((page - 1) * pageSize, page * pageSize)

  return NextResponse.json({ threads: paged, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { category_id, author_id, title, slug, body: content } = body

  if (!title || !content || !author_id || !category_id) {
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
  }

  const ref = await addDoc(collection(db, "threads"), {
    category_id,
    author_id,
    title,
    slug,
    body: content,
    status: "published",
    is_pinned: false,
    is_locked: false,
    views: 0,
    replies_count: 0,
    votes_count: 0,
    best_answer_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  return NextResponse.json({ id: ref.id, slug })
}
