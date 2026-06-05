import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  const snap = await getDocs(query(collection(db, "reports"), orderBy("created_at", "desc")))
  const reports = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return NextResponse.json(reports)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { reporter_id, target_type, target_id, reason } = body

  if (!reporter_id || !target_type || !target_id || !reason) {
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
  }

  const ref = await addDoc(collection(db, "reports"), {
    reporter_id,
    target_type,
    target_id,
    reason,
    status: "open",
    created_at: new Date().toISOString(),
  })

  return NextResponse.json({ id: ref.id })
}
