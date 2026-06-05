import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  const snap = await getDocs(query(collection(db, "categories"), orderBy("sort_order")))
  const categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, slug, description, icon, sort_order } = body

  if (!name || !slug) {
    return NextResponse.json({ error: "الاسم والرابط المختصر مطلوبان" }, { status: 400 })
  }

  const ref = await addDoc(collection(db, "categories"), {
    name,
    slug,
    description: description || "",
    icon: icon || "💬",
    sort_order: Number(sort_order) || 0,
    threads_count: 0,
    replies_count: 0,
    created_at: new Date().toISOString(),
  })

  return NextResponse.json({ id: ref.id, name, slug })
}
