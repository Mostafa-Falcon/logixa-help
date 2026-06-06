import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  const snap = await getDocs(query(collection(db, "categories"), orderBy("order")))
  const categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, icon } = body

  if (!name) {
    return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 })
  }

  const ref = await addDoc(collection(db, "categories"), {
    name,
    description: description || "",
    icon: icon || "💬",
    order: 0,
    threadCount: 0,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ id: ref.id, name })
}
