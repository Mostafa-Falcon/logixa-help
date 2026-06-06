import { NextResponse } from "next/server"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const snap = await getDocs(query(collection(db, "profiles"), where("username", "==", username)))
  if (snap.empty) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })

  const profile = { id: snap.docs[0].id, ...snap.docs[0].data() }

  const threadsSnap = await getDocs(
    query(collection(db, "threads"), where("authorUid", "==", snap.docs[0].id)),
  )
  const threads = threadsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  return NextResponse.json({ profile, threads })
}
